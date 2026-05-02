import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const filter: Record<string, string> = {};

  // Role-based filtering: sales only sees own leads
  if (user.role === "sales") {
    filter.sales_id = `eq.${user.userId}`;
  }

  if (status && status !== "all") {
    filter.status = `eq.${status}`;
  }

  if (search) {
    filter.or = `(name.ilike.*${search}*,company.ilike.*${search}*,contact.ilike.*${search}*)`;
  }

  const leads = await supabase.select("leads", {
    filter,
    order: "created_at.desc",
    select: "*",
  });

  return NextResponse.json({ success: true, data: leads });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, company, contact, email, address, needs, status } = body;

  if (!name || !contact) {
    return NextResponse.json(
      { error: "Nama dan kontak wajib diisi" },
      { status: 400 }
    );
  }

  const leads = await supabase.insert("leads", {
    name,
    company: company || null,
    contact,
    email: email || null,
    address: address || null,
    needs: needs || null,
    status: status || "new",
    sales_id: user.userId,
  });

  const created = leads[0] as Record<string, unknown>;
  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "created",
    entityType: "lead",
    entityId: created.id as string,
    entityName: name,
    details: `Lead baru ditambahkan: ${name}${company ? ` (${company})` : ""}`,
  });

  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
