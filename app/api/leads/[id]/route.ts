import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const filter: Record<string, string> = { id: `eq.${id}` };
  if (user.role === "sales") filter.sales_id = `eq.${user.userId}`;

  const lead = await supabase.selectOne("leads", { filter });
  if (!lead) return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ success: true, data: lead });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const filter: Record<string, string> = { id: `eq.${id}` };
  if (user.role === "sales") filter.sales_id = `eq.${user.userId}`;

  const updated = await supabase.update("leads", filter, {
    ...body,
    updated_at: new Date().toISOString(),
  });

  if (!updated.length) {
    return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });
  }

  const result = updated[0] as Record<string, unknown>;
  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "updated",
    entityType: "lead",
    entityId: id,
    entityName: (result.name as string) || "",
    details: `Lead diperbarui: ${result.name}`,
  });

  return NextResponse.json({ success: true, data: result });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const filter: Record<string, string> = { id: `eq.${id}` };
  if (user.role === "sales") filter.sales_id = `eq.${user.userId}`;

  const lead = await supabase.selectOne("leads", { filter });
  if (!lead) return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });

  const leadData = lead as Record<string, unknown>;

  await supabase.delete("leads", filter);
  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "deleted",
    entityType: "lead",
    entityId: id,
    entityName: (leadData.name as string) || "",
    details: `Lead dihapus: ${leadData.name}`,
  });
  return NextResponse.json({ success: true });
}
