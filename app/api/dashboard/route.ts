import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter: Record<string, string> = {};
    if (user.role === "sales") filter.sales_id = `eq.${user.userId}`;

    const [leads, projects, customers] = await Promise.all([
      supabase.select("leads", { filter }),
      supabase.select("projects", { filter }),
      supabase.select("customers", { filter }),
    ]);

    const leadsArr = leads as Record<string, unknown>[];
    const projectsArr = projects as Record<string, unknown>[];
    const customersArr = customers as Record<string, unknown>[];

    const approvedProjects = projectsArr.filter((p) => p.status === "approved");
    const pendingProjects = projectsArr.filter((p) => p.status === "waiting_approval");

    const totalRevenue = approvedProjects.reduce((s, p) => s + Number(p.total_amount || 0), 0);
    const pendingDeals = pendingProjects.length;
    
    // Sort to get actual recent
    const recentLeads = leadsArr.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()).slice(0, 5);
    const recentProjects = projectsArr.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()).slice(0, 5);

    // Trend calculation helpers
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const calcTrend = (items: any[], dateField: string, valueField?: string) => {
      const current = items
        .filter((item) => new Date(item[dateField]) >= thirtyDaysAgo)
        .reduce((s, item) => s + (valueField ? Number(item[valueField] || 0) : 1), 0);
      
      const previous = items
        .filter((item) => {
          const d = new Date(item[dateField]);
          return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        })
        .reduce((s, item) => s + (valueField ? Number(item[valueField] || 0) : 1), 0);

      if (previous === 0) return { value: "100%", trend: current >= 0 ? "up" : "down" };
      const change = ((current - previous) / previous) * 100;
      return { value: Math.abs(change).toFixed(1) + "%", trend: change >= 0 ? "up" : "down" };
    };

    // Sparkline generation (last 15 intervals of 3 days to cover 45 days)
    const buildSparkline = (items: any[], dateField: string, valueField?: string) => {
      const result = [];
      for (let i = 14; i >= 0; i--) {
        const dEnd = new Date();
        dEnd.setDate(dEnd.getDate() - (i * 3));
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - 3);
        
        const periodItems = items.filter(item => {
          const d = new Date(item[dateField]);
          return d >= dStart && d < dEnd;
        });
        
        const value = valueField 
          ? periodItems.reduce((s, it) => s + Number(it[valueField] || 0), 0)
          : periodItems.length;
        result.push({ value });
      }
      return result;
    };

    // Fetch recent activity logs
    const logFilter: Record<string, string> = {};
    if (user.role === "sales") logFilter.user_id = `eq.${user.userId}`;

    let recentActivities: Record<string, unknown>[] = [];
    try {
      recentActivities = await supabase.select("activity_logs", {
        filter: logFilter,
        order: "created_at.desc",
        limit: 8,
      }) as Record<string, unknown>[];
    } catch {
      // Table might not exist yet — gracefully handle
      recentActivities = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: leadsArr.length,
        totalCustomers: customersArr.length,
        pendingDeals,
        totalRevenue,
        recentLeads,
        recentProjects,
        recentActivities,
        // Trends
        revenueTrend: calcTrend(approvedProjects, "created_at", "total_amount"),
        customersTrend: calcTrend(customersArr, "created_at"),
        pendingTrend: calcTrend(pendingProjects, "created_at"),
        leadsTrend: calcTrend(leadsArr, "created_at"),
        // Sparklines
        revenueSparkline: buildSparkline(approvedProjects, "created_at", "total_amount"),
        customersSparkline: buildSparkline(customersArr, "created_at"),
        pendingSparkline: buildSparkline(pendingProjects, "created_at"),
        leadsSparkline: buildSparkline(leadsArr, "created_at"),
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
