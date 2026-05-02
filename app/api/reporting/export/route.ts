import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import type { Project } from "@/types";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, string> = {};
  if (user.role === "sales") filter.sales_id = `eq.${user.userId}`;
  if (from) filter["created_at"] = `gte.${from}`;

  const projects = await supabase.select<Project>("projects", {
    filter,
    order: "created_at.desc",
  });

  let filteredProjects = projects;
  if (to) {
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1);
    filteredProjects = projects.filter((p) => new Date(p.created_at) <= toDate);
  }

  const rows = filteredProjects.map((p, i) => ({
    No: i + 1,
    "Nama Project": p.project_name,
    Status: p.status === "approved" ? "Disetujui" : p.status === "rejected" ? "Ditolak" : "Menunggu Approval",
    "Total Amount": Number(p.total_amount),
    "Tanggal Dibuat": new Date(p.created_at).toLocaleDateString("id-ID"),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan_crm_${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
