import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import type { Lead } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only managers can approve/reject
  if (user.role !== "manager") {
    return NextResponse.json({ error: "Hanya manager yang dapat melakukan approval" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, rejection_reason } = body;

  if (!action || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Action harus 'approve' atau 'reject'" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    status: action === "approve" ? "approved" : "rejected",
    approved_by: user.userId,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (action === "reject" && rejection_reason) {
    updateData.rejection_reason = rejection_reason;
  }

  const updated = await supabase.update("projects", { id: `eq.${id}` }, updateData);

  if (!updated.length) {
    return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
  }

  // If approved, create customer and services
  if (action === "approve") {
    const project = updated[0] as Record<string, unknown>;

    // Fetch lead data
    const lead = await supabase.selectOne<Lead>("leads", {
      filter: { id: `eq.${project.lead_id}` },
    });

    if (lead) {
      // Update lead status to 'won'
      await supabase.update("leads", { id: `eq.${lead.id}` }, {
        status: "won",
        updated_at: new Date().toISOString(),
      });

      // Create customer
      const customers = await supabase.insert("customers", {
        name: lead.name,
        company: lead.company || null,
        contact: lead.contact,
        email: lead.email || null,
        address: lead.address || null,
        project_id: id,
        sales_id: project.sales_id,
      });

      const customer = (customers as Record<string, unknown>[])[0];

      // Fetch project items and create customer services
      const items = await supabase.select("project_items", {
        filter: { project_id: `eq.${id}` },
      }) as Record<string, unknown>[];

      if (items.length > 0) {
        const services = items.map((item) => ({
          customer_id: customer.id,
          product_id: item.product_id,
          price: item.negotiated_price,
          start_date: new Date().toISOString().split("T")[0],
          status: "active",
        }));

        await supabase.insert("customer_services", services, false);
      }
    }
  }

  const projectData = updated[0] as Record<string, unknown>;
  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: action === "approve" ? "approved" : "rejected",
    entityType: "project",
    entityId: id,
    entityName: (projectData.project_name as string) || "",
    details: action === "approve"
      ? `Project disetujui: ${projectData.project_name}`
      : `Project ditolak: ${projectData.project_name}${rejection_reason ? ` — ${rejection_reason}` : ""}`,
  });

  return NextResponse.json({ success: true, data: projectData });
}
