"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { formatRupiah, formatDate, getLeadStatusConfig, getProjectStatusConfig, getInitials, generateAvatarColor } from "@/lib/utils";
import { Users, UserCheck, FolderKanban, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, Plus, Edit2, Trash2, Check, X, FileDown, Clock } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_name?: string;
  details?: string;
  created_at: string;
}

interface DashboardData {
  totalLeads: number;
  totalCustomers: number;
  pendingDeals: number;
  totalRevenue: number;
  recentLeads: { id: string; name: string; company?: string; status: string; created_at: string }[];
  recentProjects: { id: string; project_name: string; status: string; total_amount: number; created_at: string }[];
  recentActivities: ActivityLog[];
  revenueTrend?: { value: string, trend: "up" | "down" };
  customersTrend?: { value: string, trend: "up" | "down" };
  pendingTrend?: { value: string, trend: "up" | "down" };
  leadsTrend?: { value: string, trend: "up" | "down" };
  revenueSparkline?: { value: number }[];
  customersSparkline?: { value: number }[];
  pendingSparkline?: { value: number }[];
  leadsSparkline?: { value: number }[];
}

const generateSparkline = (trend: "up" | "down", startValue: number) => {
  let val = startValue;
  return Array.from({ length: 15 }).map(() => {
    val += trend === "up" ? Math.random() * 15 - 3 : Math.random() * 15 - 12;
    return { value: Math.max(10, val) };
  });
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatRupiah(data?.totalRevenue || 0),
      icon: TrendingUp,
      iconColor: "#ffffff",
      iconBg: "#22c55e",
      change: data?.revenueTrend,
      chartColor: "#16a34a",
      chartData: data?.revenueSparkline || generateSparkline("up", 40),
      isRupiah: true,
    },
    {
      title: "Pelanggan Aktif",
      value: data?.totalCustomers || 0,
      icon: UserCheck,
      iconColor: "#ffffff",
      iconBg: "#3b82f6",
      change: data?.customersTrend,
      chartColor: "#0d9488",
      chartData: data?.customersSparkline || generateSparkline("up", 20),
    },
    {
      title: "Deal Pending",
      value: data?.pendingDeals || 0,
      icon: FolderKanban,
      iconColor: "#ffffff",
      iconBg: "#8b5cf6",
      change: data?.pendingTrend,
      chartColor: "#2563eb",
      chartData: data?.pendingSparkline || generateSparkline("down", 80),
    },
    {
      title: "Total Leads",
      value: data?.totalLeads || 0,
      icon: Users,
      iconColor: "#ffffff",
      iconBg: "#ea580c",
      change: data?.leadsTrend,
      chartColor: "#d97706",
      chartData: data?.leadsSparkline || generateSparkline("up", 10),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-foreground-muted mt-0.5">
          Selamat datang, {user?.name}! {user?.role === "manager" ? "Anda melihat data seluruh tim." : "Berikut ringkasan data Anda."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`animate-fade-in stagger-${i + 1} overflow-hidden shadow-sm border border-border-light`}>
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">{stat.title}</p>
                    <p className="text-[22px] font-bold text-foreground tracking-tight leading-tight mt-1">
                      {stat.isRupiah ? stat.value : String(stat.value)}
                    </p>
                    {stat.change && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium">
                        <span className={`flex items-center gap-0.5 ${stat.change.trend === "up" ? "text-success" : "text-error"}`}>
                          {stat.change.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {stat.change.value}
                        </span>
                        <span className="text-foreground-muted font-normal">vs last month</span>
                      </div>
                    )}
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: stat.iconColor }} />
                  </div>
                </div>
              </div>
              {/* Sparkline — flush bottom, thin & smooth */}
              <div className="h-[38px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={stat.chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.12}/>
                        <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotoneX" 
                      dataKey="value" 
                      stroke={stat.chartColor} 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill={`url(#gradient-${i})`} 
                      isAnimationActive={false}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card className="animate-fade-in stagger-5">
          <CardHeader>
            <CardTitle>Lead Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentLeads?.length === 0 ? (
              <p className="text-sm text-foreground-muted py-8 text-center">Belum ada data lead</p>
            ) : (
              <div className="space-y-3">
                {data?.recentLeads?.map((lead) => {
                  const statusConfig = getLeadStatusConfig(lead.status as "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost");
                  return (
                    <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-muted/50">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: generateAvatarColor(lead.name) }}
                      >
                        {getInitials(lead.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                        <p className="text-xs text-foreground-muted">{lead.company || "—"}</p>
                      </div>
                      <span
                        className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md"
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="animate-fade-in stagger-6">
          <CardHeader>
            <CardTitle>Project Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentProjects?.length === 0 ? (
              <p className="text-sm text-foreground-muted py-8 text-center">Belum ada data project</p>
            ) : (
              <div className="space-y-3">
                {data?.recentProjects?.map((project) => {
                  const statusConfig = getProjectStatusConfig(project.status as "waiting_approval" | "approved" | "rejected");
                  return (
                    <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-muted/50">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: statusConfig.bg }}
                      >
                        <FolderKanban className="w-4 h-4" style={{ color: statusConfig.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{project.project_name}</p>
                        <p className="text-xs text-foreground-muted">{formatRupiah(Number(project.total_amount))}</p>
                      </div>
                      <span
                        className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md whitespace-nowrap"
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      {data?.recentActivities && data.recentActivities.length > 0 && (
        <Card className="animate-fade-in stagger-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" /> Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {data.recentActivities.map((activity) => {
                  const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
                    created: { icon: Plus, color: "#16a34a", bg: "#dcfce7", label: "Membuat" },
                    updated: { icon: Edit2, color: "#2563eb", bg: "#dbeafe", label: "Memperbarui" },
                    deleted: { icon: Trash2, color: "#dc2626", bg: "#fee2e2", label: "Menghapus" },
                    approved: { icon: Check, color: "#16a34a", bg: "#dcfce7", label: "Menyetujui" },
                    rejected: { icon: X, color: "#dc2626", bg: "#fee2e2", label: "Menolak" },
                    exported: { icon: FileDown, color: "#8b5cf6", bg: "#ede9fe", label: "Export" },
                  };
                  const config = actionConfig[activity.action] || actionConfig.created;
                  const ActionIcon = config.icon;

                  const entityLabels: Record<string, string> = {
                    lead: "Lead", product: "Produk", project: "Project", customer: "Pelanggan", report: "Laporan",
                  };

                  // Time ago
                  const diffMs = Date.now() - new Date(activity.created_at).getTime();
                  const diffMin = Math.floor(diffMs / 60000);
                  const diffHr = Math.floor(diffMin / 60);
                  const diffDay = Math.floor(diffHr / 24);
                  const timeAgo = diffDay > 0 ? `${diffDay}h lalu` : diffHr > 0 ? `${diffHr}j lalu` : diffMin > 0 ? `${diffMin}m lalu` : "Baru saja";

                  return (
                    <div key={activity.id} className="flex gap-3 pl-0 relative">
                      <div
                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-background"
                        style={{ backgroundColor: config.bg }}
                      >
                        <ActionIcon className="w-3 h-3" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm text-foreground">
                              <span className="font-semibold">{activity.user_name}</span>{" "}
                              <span className="text-foreground-muted">{config.label.toLowerCase()}</span>{" "}
                              <span className="font-medium">{entityLabels[activity.entity_type] || activity.entity_type}</span>
                              {activity.entity_name && (
                                <span className="text-brand font-medium"> {activity.entity_name}</span>
                              )}
                            </p>
                          </div>
                          <span className="text-[11px] text-foreground-muted whitespace-nowrap shrink-0">{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
