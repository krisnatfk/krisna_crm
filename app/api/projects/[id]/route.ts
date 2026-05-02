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

  const project = await supabase.selectOne("projects", { filter });
  if (!project) return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });

  const items = await supabase.select("project_items", {
    filter: { project_id: `eq.${id}` },
  });

  return NextResponse.json({ success: true, data: { ...project, items } });
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

  const projectRow = await supabase.selectOne("projects", { filter });
  if (!projectRow) {
    return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
  }
  const projectData = projectRow as Record<string, unknown>;

  await supabase.delete("project_items", { project_id: `eq.${id}` });
  await supabase.delete("projects", filter);

  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "deleted",
    entityType: "project",
    entityId: id,
    entityName: (projectData.project_name as string) || "",
    details: `Project dihapus: ${projectData.project_name}`,
  });

  return NextResponse.json({ success: true });
}
