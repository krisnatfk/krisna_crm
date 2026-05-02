import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import type { Product } from "@/types";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  const filter: Record<string, string> = {};
  if (user.role === "sales") filter.sales_id = `eq.${user.userId}`;
  if (status && status !== "all") filter.status = `eq.${status}`;

  const projects = await supabase.select("projects", {
    filter,
    order: "created_at.desc",
  });

  // For each project, fetch items
  const projectsWithItems = await Promise.all(
    (projects as Record<string, unknown>[]).map(async (project) => {
      const items = await supabase.select("project_items", {
        filter: { project_id: `eq.${project.id}` },
      });
      return { ...project, items };
    })
  );

  return NextResponse.json({ success: true, data: projectsWithItems });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { project_name, lead_id, notes, items } = body;

  if (!project_name || !lead_id || !items?.length) {
    return NextResponse.json(
      { error: "Nama project, lead, dan minimal 1 produk wajib diisi" },
      { status: 400 }
    );
  }

  // Get product prices to check if needs approval
  const products = await supabase.select<Product>("products", {
    filter: { id: `in.(${items.map((i: { product_id: string }) => i.product_id).join(",")})` },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  let needsApproval = false;
  const processedItems = items.map((item: { product_id: string; quantity: number; negotiated_price: number }) => {
    const product = productMap.get(item.product_id);
    const originalPrice = product?.sell_price || 0;
    const itemNeedsApproval = item.negotiated_price < originalPrice;
    if (itemNeedsApproval) needsApproval = true;
    totalAmount += item.negotiated_price * item.quantity;

    return {
      product_id: item.product_id,
      quantity: item.quantity,
      original_price: originalPrice,
      negotiated_price: item.negotiated_price,
      needs_approval: itemNeedsApproval,
    };
  });

  // If no items need approval and user is manager, auto-approve
  const projectStatus =
    !needsApproval && user.role === "manager"
      ? "approved"
      : needsApproval
        ? "waiting_approval"
        : "waiting_approval";

  // Create project
  const projectResult = await supabase.insert("projects", {
    project_name,
    lead_id,
    sales_id: user.userId,
    status: projectStatus,
    notes: notes || null,
    total_amount: totalAmount,
  });

  const project = (projectResult as Record<string, unknown>[])[0];

  // Create project items
  const itemsToInsert = processedItems.map((item: Record<string, unknown>) => ({
    ...item,
    project_id: project.id,
  }));

  await supabase.insert("project_items", itemsToInsert, false);

  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "created",
    entityType: "project",
    entityId: project.id as string,
    entityName: project_name,
    details: `Project baru: ${project_name} — ${items.length} produk, total ${totalAmount}`,
  });

  return NextResponse.json({ success: true, data: project }, { status: 201 });
}
