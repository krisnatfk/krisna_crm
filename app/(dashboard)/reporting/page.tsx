"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate, getProjectStatusConfig } from "@/lib/utils";
import { Download, Loader2, TrendingUp, Users, FolderKanban, Target, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface ReportData {
  summary: {
    totalRevenue: number;
    totalDeals: number;
    totalCustomers: number;
    totalLeads: number;
    conversionRate: number;
    avgDealValue: number;
  };
  revenueByMonth: { month: string; revenue: number; deals: number }[];
  dealsByStatus: { status: string; count: number }[];
  transactions: {
    id: string;
    project_name: string;
    status: "waiting_approval" | "approved" | "rejected";
    total_amount: number;
    created_at: string;
  }[];
}

const PIE_COLORS = ["#d97706", "#0d7c5a", "#dc2626"];

export default function ReportingPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { setPage(1); }, [data]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    const res = await fetch(`/api/reporting?${params}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async () => {
    setExporting(true);
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    const res = await fetch(`/api/reporting/export?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_crm_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const summaryCards = data ? [
    { title: "Total Revenue", value: formatRupiah(data.summary.totalRevenue), icon: TrendingUp, color: "#ffffff", bg: "#22c55e" },
    { title: "Total Deals", value: String(data.summary.totalDeals), icon: FolderKanban, color: "#ffffff", bg: "#3b82f6" },
    { title: "Total Pelanggan", value: String(data.summary.totalCustomers), icon: Users, color: "#ffffff", bg: "#8b5cf6" },
    { title: "Conversion Rate", value: `${data.summary.conversionRate}%`, icon: Target, color: "#ffffff", bg: "#ea580c" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Laporan</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Laporan penjualan dan performa tim</p>
        </div>
        <Button variant="primary" size="sm" className="gap-1.5" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download Excel
        </Button>
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 w-full">
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-medium text-foreground-secondary flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Dari Tanggal
              </label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-background text-foreground rounded-[var(--radius)] border border-border outline-none focus:ring-2 focus:ring-brand/20 transition-all" />
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-medium text-foreground-secondary flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Sampai Tanggal
              </label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-background text-foreground rounded-[var(--radius)] border border-border outline-none focus:ring-2 focus:ring-brand/20 transition-all" />
            </div>
            <Button variant="outline" size="sm" onClick={() => { setFromDate(""); setToDate(""); }} className="h-9 w-full sm:w-auto mt-1 sm:mt-0">Reset</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className={`animate-fade-in stagger-${i + 1}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground-muted">{card.title}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                        <Icon className="w-5 h-5" style={{ color: card.color }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 animate-fade-in stagger-5">
              <CardHeader><CardTitle>Revenue per Bulan</CardTitle></CardHeader>
              <CardContent>
                {data.revenueByMonth.length === 0 ? (
                  <p className="text-sm text-foreground-muted text-center py-8">Belum ada data</p>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(value) => [formatRupiah(Number(value)), "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="oklch(0.55 0.19 160)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deals by Status */}
            <Card className="animate-fade-in stagger-6">
              <CardHeader><CardTitle>Deals by Status</CardTitle></CardHeader>
              <CardContent>
                {data.dealsByStatus.every((d) => d.count === 0) ? (
                  <p className="text-sm text-foreground-muted text-center py-8">Belum ada data</p>
                ) : (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.dealsByStatus.filter((d) => d.count > 0)} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                          {data.dealsByStatus.filter((d) => d.count > 0).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {/* Legend */}
                <div className="space-y-2 mt-2">
                  {data.dealsByStatus.map((d, i) => (
                    <div key={d.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-foreground-secondary">{d.status}</span>
                      </div>
                      <span className="font-semibold text-foreground">{d.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="animate-fade-in stagger-7">
            <CardHeader><CardTitle>Daftar Transaksi</CardTitle></CardHeader>
            <CardContent className="p-0">
              {data.transactions.length === 0 ? (
                <p className="text-sm text-foreground-muted text-center py-8">Belum ada transaksi</p>
              ) : (
                <div className="flex flex-col">
                  {/* Desktop Table */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Project</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                          <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Amount</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((tx) => {
                          const sc = getProjectStatusConfig(tx.status);
                          return (
                            <tr key={tx.id} className="border-b border-border-light hover:bg-background-hover/50 transition-colors">
                              <td className="px-5 py-3 font-medium text-foreground">{tx.project_name}</td>
                              <td className="px-5 py-3">
                                <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md" style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                              </td>
                              <td className="px-5 py-3 text-right font-medium text-foreground">{formatRupiah(Number(tx.total_amount))}</td>
                              <td className="px-5 py-3 text-foreground-muted text-xs">{formatDate(tx.created_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-background-muted/10">
                    {data.transactions.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((tx) => {
                      const sc = getProjectStatusConfig(tx.status);
                      return (
                        <Card key={tx.id} className="shadow-sm border border-border bg-background">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-sm text-foreground">{tx.project_name}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ml-2" style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-border-light">
                              <div>
                                <p className="text-[11px] text-foreground-muted mb-1">Amount</p>
                                <p className="text-sm font-bold text-foreground">{formatRupiah(Number(tx.total_amount))}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-foreground-muted mb-1">Tanggal</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(tx.created_at)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-border gap-4 bg-background-muted/20">
                    <div className="text-sm text-foreground-muted text-center sm:text-left">
                      Showing {data.transactions.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-{Math.min(page * rowsPerPage, data.transactions.length)} of {data.transactions.length} results
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground-muted hidden sm:inline">Rows</span>
                        <select 
                          value={rowsPerPage} 
                          onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} 
                          className="h-8 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-brand"
                        >
                          {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 h-8">
                          <ChevronLeft className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
                        </Button>
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {Array.from({ length: Math.ceil(data.transactions.length / rowsPerPage) || 1 }).map((_, i) => (
                            <Button key={i} variant={page === i + 1 ? "primary" : "ghost"} size="icon" className="w-8 h-8 rounded-md text-xs" onClick={() => setPage(i + 1)}>{i + 1}</Button>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(Math.ceil(data.transactions.length / rowsPerPage) || 1, p + 1))} disabled={page >= (Math.ceil(data.transactions.length / rowsPerPage) || 1)} className="px-2 h-8">
                          <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4 sm:ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
