"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Loader2, Plus, Edit2, Trash2, Check, X, FileDown,
  Clock, ChevronLeft, ChevronRight, History,
} from "lucide-react";

interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_name?: string;
  details?: string;
  created_at: string;
}

const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  created: { icon: Plus, color: "#ffffff", bg: "#16a34a", label: "Dibuat" },
  updated: { icon: Edit2, color: "#ffffff", bg: "#2563eb", label: "Diperbarui" },
  deleted: { icon: Trash2, color: "#ffffff", bg: "#dc2626", label: "Dihapus" },
  approved: { icon: Check, color: "#ffffff", bg: "#16a34a", label: "Disetujui" },
  rejected: { icon: X, color: "#ffffff", bg: "#dc2626", label: "Ditolak" },
  exported: { icon: FileDown, color: "#ffffff", bg: "#8b5cf6", label: "Diexport" },
};

const entityLabels: Record<string, string> = {
  lead: "Lead",
  product: "Produk",
  project: "Project",
  customer: "Pelanggan",
  report: "Laporan",
};

const entityFilters = [
  { value: "all", label: "Semua Entitas" },
  { value: "lead", label: "Lead" },
  { value: "product", label: "Produk" },
  { value: "project", label: "Project" },
  { value: "customer", label: "Pelanggan" },
  { value: "report", label: "Laporan" },
];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => { setPage(1); }, [filterEntity]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (filterEntity !== "all") params.set("entity_type", filterEntity);

    const res = await fetch(`/api/activity-logs?${params}`);
    const data = await res.json();
    if (data.success) setLogs(data.data);
    setLoading(false);
  }, [filterEntity]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const paginatedLogs = logs.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(logs.length / rowsPerPage) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Riwayat semua aktivitas dalam sistem CRM</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Filter:</span>
            </div>
            <Select
              options={entityFilters}
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-[180px] sm:w-56"
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-10 h-10 text-foreground-muted/30 mx-auto mb-3" />
              <p className="text-sm text-foreground-muted">Belum ada aktivitas tercatat</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Waktu</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">User</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Aksi</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Entitas</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => {
                      const config = actionConfig[log.action] || actionConfig.created;
                      const ActionIcon = config.icon;
                      return (
                        <tr key={log.id} className="border-b border-border-light hover:bg-background-hover/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-foreground-muted" />
                                <span className="text-xs font-medium text-foreground">{formatDate(log.created_at)}</span>
                              </div>
                              <span className="text-[11px] text-foreground-muted ml-5">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-foreground text-sm">{log.user_name}</p>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md"
                              style={{ backgroundColor: config.bg, color: config.color }}
                            >
                              <ActionIcon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-sm text-foreground">
                              <span className="text-foreground-muted">{entityLabels[log.entity_type] || log.entity_type}</span>
                              {log.entity_name && <span className="font-medium text-brand ml-1.5">{log.entity_name}</span>}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            <p className="text-xs text-foreground-muted truncate max-w-[300px]">{log.details || "—"}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-3 p-4 md:hidden bg-background-muted/10">
                {paginatedLogs.map((log) => {
                  const config = actionConfig[log.action] || actionConfig.created;
                  const ActionIcon = config.icon;

                  const diffMs = Date.now() - new Date(log.created_at).getTime();
                  const diffMin = Math.floor(diffMs / 60000);
                  const diffHr = Math.floor(diffMin / 60);
                  const diffDay = Math.floor(diffHr / 24);
                  const timeAgo = diffDay > 0 ? `${diffDay}h lalu` : diffHr > 0 ? `${diffHr}j lalu` : diffMin > 0 ? `${diffMin}m lalu` : "Baru saja";

                  return (
                    <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-background border border-border-light">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <ActionIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{log.user_name}</span>{" "}
                            <span className="text-foreground-muted">{config.label.toLowerCase()}</span>{" "}
                            <span className="font-medium">{entityLabels[log.entity_type] || log.entity_type}</span>
                          </p>
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-[10px] text-foreground-muted whitespace-nowrap">{timeAgo}</span>
                            <span className="text-[9px] text-foreground-muted/70 whitespace-nowrap mt-0.5">{formatDateTime(log.created_at)}</span>
                          </div>
                        </div>
                        {log.entity_name && (
                          <p className="text-xs text-brand font-medium mt-0.5 truncate">{log.entity_name}</p>
                        )}
                        {log.details && (
                          <p className="text-[11px] text-foreground-muted mt-1 truncate">{log.details}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-border gap-4 bg-background-muted/20">
                <div className="text-sm text-foreground-muted text-center sm:text-left">
                  Showing {logs.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-{Math.min(page * rowsPerPage, logs.length)} of {logs.length} results
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 h-8">
                    <ChevronLeft className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button key={i} variant={page === i + 1 ? "primary" : "ghost"} size="icon" className="w-8 h-8 rounded-md text-xs" onClick={() => setPage(i + 1)}>{i + 1}</Button>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 h-8">
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
