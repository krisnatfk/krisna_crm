import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import type { Project, Lead } from "@/types";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Fetch projects (deals)
    const projectFilter: Record<string, string> = {};
    if (user.role === "sales") projectFilter.sales_id = `eq.${user.userId}`;
    if (from) projectFilter["created_at"] = `gte.${from}`;

    const projects = await supabase.select<Project>("projects", {
      filter: projectFilter,
      order: "created_at.desc",
    });

    // Filter by 'to' date if provided
    let filteredProjects = projects;
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      filteredProjects = projects.filter((p) => new Date(p.created_at) <= toDate);
    }

    // Fetch leads count
    const leadFilter: Record<string, string> = {};
    if (user.role === "sales") leadFilter.sales_id = `eq.${user.userId}`;
    const leads = await supabase.select<Lead>("leads", { filter: leadFilter });

    // Fetch customers
    const customerFilter: Record<string, string> = {};
    if (user.role === "sales") customerFilter.sales_id = `eq.${user.userId}`;
    const customers = await supabase.select("customers", { filter: customerFilter });

    // Calculate summary
    const approvedProjects = filteredProjects.filter((p) => p.status === "approved");
    const totalRevenue = approvedProjects.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const totalDeals = filteredProjects.length;
    const totalCustomers = (customers as unknown[]).length;
    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? (totalCustomers / totalLeads) * 100 : 0;
    const avgDealValue = approvedProjects.length > 0 ? totalRevenue / approvedProjects.length : 0;

    // Revenue by month
    const revenueByMonth: Record<string, { revenue: number; deals: number }> = {};
    approvedProjects.forEach((p) => {
      const month = new Date(p.created_at).toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });
      if (!revenueByMonth[month]) revenueByMonth[month] = { revenue: 0, deals: 0 };
      revenueByMonth[month].revenue += Number(p.total_amount);
      revenueByMonth[month].deals += 1;
    });

    // Deals by status
    const dealsByStatus = [
      { status: "Menunggu Approval", count: filteredProjects.filter((p) => p.status === "waiting_approval").length },
      { status: "Disetujui", count: filteredProjects.filter((p) => p.status === "approved").length },
      { status: "Ditolak", count: filteredProjects.filter((p) => p.status === "rejected").length },
    ];

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalDeals,
          totalCustomers,
          totalLeads,
          conversionRate: Math.round(conversionRate * 10) / 10,
          avgDealValue: Math.round(avgDealValue),
        },
        revenueByMonth: Object.entries(revenueByMonth).map(([month, data]) => ({
          month,
          ...data,
        })),
        dealsByStatus,
        transactions: filteredProjects,
      },
    });
  } catch (error) {
    console.error("Reporting error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data laporan" },
      { status: 500 }
    );
  }
}
