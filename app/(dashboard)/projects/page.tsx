"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { formatRupiah, formatDate, getProjectStatusConfig } from "@/lib/utils";
import type { Product, Lead } from "@/types";
import { Plus, Loader2, FolderKanban, Check, X, AlertTriangle, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, SlidersHorizontal, Download } from "lucide-react";
import { exportToExcel } from "@/lib/export";

interface ProjectData {
  id: string;
  project_name: string;
  lead_id: string;
  sales_id: string;
  status: "waiting_approval" | "approved" | "rejected";
  notes?: string;
  total_amount: number;
  rejection_reason?: string;
  created_at: string;
  items: {
    id: string;
    product_id: string;
    quantity: number;
    original_price: number;
    negotiated_price: number;
    needs_approval: boolean;
  }[];
}

interface ItemForm {
  product_id: string;
  quantity: number;
  negotiated_price: number;
}

export default function ProjectsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showApproval, setShowApproval] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { setPage(1); }, [filterStatus, search]);

  const [form, setForm] = useState({ project_name: "", lead_id: "", notes: "" });
  const [items, setItems] = useState<ItemForm[]>([{ product_id: "", quantity: 1, negotiated_price: 0 }]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);

    const [projRes, prodRes, leadRes] = await Promise.all([
      fetch(`/api/projects?${params}`),
      fetch("/api/products"),
      fetch("/api/leads"),
    ]);

    const [projData, prodData, leadData] = await Promise.all([
      projRes.json(), prodRes.json(), leadRes.json(),
    ]);

    if (projData.success) setProjects(projData.data);
    if (prodData.success) setProducts(prodData.data);
    if (leadData.success) setLeads(leadData.data);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const addItem = () => setItems([...items, { product_id: "", quantity: 1, negotiated_price: 0 }]);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemForm, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "product_id") {
      item.product_id = value as string;
      const product = productMap.get(value as string);
      if (product) item.negotiated_price = product.sell_price;
    } else if (field === "quantity") {
      item.quantity = value as number;
    } else if (field === "negotiated_price") {
      item.negotiated_price = value as number;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const totalAmount = items.reduce((s, i) => s + i.negotiated_price * i.quantity, 0);
  const hasDiscountedItems = items.some((i) => {
    const p = productMap.get(i.product_id);
    return p && i.negotiated_price < p.sell_price;
  });

  const handleSave = async () => {
    if (!form.project_name || !form.lead_id || items.some((i) => !i.product_id)) {
      addToast("error", "Validasi", "Lengkapi semua field yang wajib");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    if (res.ok) {
      addToast("success", "Project dibuat");
      setShowForm(false);
      setForm({ project_name: "", lead_id: "", notes: "" });
      setItems([{ product_id: "", quantity: 1, negotiated_price: 0 }]);
      fetchAll();
    } else addToast("error", "Gagal membuat project");
    setSaving(false);
  };

  const handleApproval = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/projects/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    });
    if (res.ok) {
      addToast("success", action === "approve" ? "Project disetujui" : "Project ditolak");
      setShowApproval(null);
      setRejectionReason("");
      fetchAll();
    } else {
      const data = await res.json();
      addToast("error", data.error || "Gagal memproses approval");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) { addToast("success", "Project dihapus"); setShowDelete(null); fetchAll(); }
    else addToast("error", "Gagal menghapus");
  };

  const statusFilters = [
    { value: "all", label: "Semua Status" },
    { value: "waiting_approval", label: "Menunggu Approval" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
  ];

  const handleExport = () => {
    const dataToExport = projects.map((p, i) => ({
      No: i + 1,
      Project: p.project_name,
      Klien: p.lead_name,
      Sales: p.sales_name,
      "Total Amount": Number(p.total_amount),
      Status: p.status === "approved" ? "Disetujui" : p.status === "rejected" ? "Ditolak" : "Menunggu Approval",
      "Tanggal Dibuat": formatDate(p.created_at)
    }));
    exportToExcel(dataToExport, "Data_Projects", "Projects");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Projects / Deal Pipeline</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Konversi lead menjadi pelanggan</p>
        </div>
        <Button variant="primary" size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
          <Plus className="w-3.5 h-3.5" /> Buat Project
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Cari nama project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-background text-foreground rounded-[var(--radius)] border border-border outline-none placeholder:text-foreground-muted focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select options={statusFilters} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-[180px] sm:w-56" />
              <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-9 shrink-0" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {(() => {
        const filteredProjects = projects.filter(p =>
          p.project_name.toLowerCase().includes(search.toLowerCase())
        );
        const paginatedProjects = filteredProjects.slice((page - 1) * rowsPerPage, page * rowsPerPage);
        const totalPages = Math.ceil(filteredProjects.length / rowsPerPage) || 1;

        return (
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16"><p className="text-sm text-foreground-muted">Belum ada project</p></div>
              ) : (
                <div className="flex flex-col">
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Project</th>
                          <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">Produk</th>
                          <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total</th>
                          <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                          <th className="w-10 px-3 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProjects.map((proj) => {
                          const sc = getProjectStatusConfig(proj.status);
                          const isExpanded = expandedId === proj.id;
                          return (
                            <Fragment key={proj.id}>
                              <tr className="border-b border-border-light hover:bg-background-hover/50 transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : proj.id)}>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: sc.bg }}><FolderKanban className="w-4 h-4" style={{ color: sc.color }} /></div>
                                    <div><p className="font-medium text-foreground">{proj.project_name}</p><p className="text-xs text-foreground-muted">{proj.notes ? proj.notes.substring(0, 50) : "—"}</p></div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-center font-medium text-foreground hidden lg:table-cell">{proj.items?.length || 0}</td>
                                <td className="px-5 py-3.5 text-right font-bold text-foreground">{formatRupiah(Number(proj.total_amount))}</td>
                                <td className="px-5 py-3.5 text-center"><span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md" style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span></td>
                                <td className="px-5 py-3.5 text-foreground-muted text-xs hidden lg:table-cell">{formatDate(proj.created_at)}</td>
                                <td className="px-3 py-3.5">{isExpanded ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}</td>
                              </tr>
                              {isExpanded && (
                                <tr className="border-b border-border bg-background-muted/30">
                                  <td colSpan={6} className="px-5 py-4">
                                    {proj.rejection_reason && <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: "var(--error-bg)" }}><p className="text-xs font-semibold" style={{ color: "#dc2626" }}>Alasan ditolak: {proj.rejection_reason}</p></div>}
                                    <table className="w-full text-xs"><thead><tr className="border-b border-border"><th className="text-left py-2 font-semibold text-foreground-muted">Produk</th><th className="text-right py-2 font-semibold text-foreground-muted">Qty</th><th className="text-right py-2 font-semibold text-foreground-muted">Harga Asli</th><th className="text-right py-2 font-semibold text-foreground-muted">Harga Nego</th><th className="text-center py-2 font-semibold text-foreground-muted">Flag</th></tr></thead>
                                      <tbody>{proj.items?.map((item, idx) => { const product = productMap.get(item.product_id); return (<tr key={idx} className="border-b border-border-light"><td className="py-2 text-foreground">{product?.name || item.product_id}</td><td className="py-2 text-right">{item.quantity}</td><td className="py-2 text-right text-foreground-muted">{formatRupiah(Number(item.original_price))}</td><td className="py-2 text-right font-medium">{formatRupiah(Number(item.negotiated_price))}</td><td className="py-2 text-center">{item.needs_approval && <AlertTriangle className="w-3.5 h-3.5 inline" style={{ color: "#d97706" }} />}</td></tr>); })}</tbody>
                                    </table>
                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-light">
                                      {user?.role === "manager" && proj.status === "waiting_approval" && (<><Button variant="primary" size="sm" className="gap-1" onClick={() => handleApproval(proj.id, "approve")}><Check className="w-3.5 h-3.5" /> Approve</Button><Button variant="outline" size="sm" className="gap-1 text-error border-error/30 hover:bg-error/10" onClick={() => { setShowApproval(proj.id); setRejectionReason(""); }}><X className="w-3.5 h-3.5" /> Reject</Button></>)}
                                      <div className="flex-1" /><Button variant="ghost" size="icon" onClick={() => setShowDelete(proj.id)}><Trash2 className="w-3.5 h-3.5 text-error" /></Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-background-muted/10">
                    {paginatedProjects.map((proj) => {
                      const sc = getProjectStatusConfig(proj.status);
                      const isExpanded = expandedId === proj.id;
                      return (
                        <Card key={proj.id} className="shadow-sm border border-border bg-background overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col p-4 cursor-pointer hover:bg-background-hover/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : proj.id)}>
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: sc.bg }}><FolderKanban className="w-5 h-5" style={{ color: sc.color }} /></div>
                                  <div><h3 className="font-semibold text-sm text-foreground">{proj.project_name}</h3><p className="text-xs text-foreground-muted">{proj.items?.length || 0} produk</p></div>
                                </div>
                                <div className="shrink-0 pt-1">{isExpanded ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-border-light">
                                <div><p className="text-[11px] text-foreground-muted mb-1">Status</p><span className="text-[10px] px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span></div>
                                <div><p className="text-[11px] text-foreground-muted mb-1">Tanggal</p><p className="text-sm font-medium text-foreground">{formatDate(proj.created_at)}</p></div>
                                <div className="col-span-2"><p className="text-[11px] text-foreground-muted mb-1">Total</p><p className="text-sm font-bold text-brand">{formatRupiah(Number(proj.total_amount))}</p></div>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-border-light pt-3">
                                {proj.rejection_reason && <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: "var(--error-bg)" }}><p className="text-xs font-semibold" style={{ color: "#dc2626" }}>Alasan ditolak: {proj.rejection_reason}</p></div>}
                                <p className="text-xs font-semibold text-foreground-secondary mb-2">Detail Produk</p>
                                <div className="space-y-2">
                                  {proj.items?.map((item, idx) => {
                                    const product = productMap.get(item.product_id);
                                    return (
                                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background-muted/50 border border-border-light">
                                        <div><p className="text-xs font-medium text-foreground">{product?.name || "—"}</p><p className="text-[10px] text-foreground-muted">Qty: {item.quantity} {item.needs_approval && "⚠️"}</p></div>
                                        <div className="text-right">
                                          <p className="text-xs font-bold text-foreground">{formatRupiah(Number(item.negotiated_price))}</p>
                                          {Number(item.negotiated_price) < Number(item.original_price) && <p className="text-[10px] text-foreground-muted line-through">{formatRupiah(Number(item.original_price))}</p>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-light">
                                  {user?.role === "manager" && proj.status === "waiting_approval" && (<><Button variant="primary" size="sm" className="gap-1 text-xs" onClick={() => handleApproval(proj.id, "approve")}><Check className="w-3.5 h-3.5" /> Approve</Button><Button variant="outline" size="sm" className="gap-1 text-xs text-error border-error/30 hover:bg-error/10" onClick={() => { setShowApproval(proj.id); setRejectionReason(""); }}><X className="w-3.5 h-3.5" /> Reject</Button></>)}
                                  <div className="flex-1" /><Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setShowDelete(proj.id)}><Trash2 className="w-3.5 h-3.5 text-error" /></Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-border gap-4 bg-background-muted/20">
                    <div className="text-sm text-foreground-muted text-center sm:text-left">
                      Showing {filteredProjects.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-{Math.min(page * rowsPerPage, filteredProjects.length)} of {filteredProjects.length} results
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
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* New Project Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Buat Project Baru" description="Konversi lead menjadi deal" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nama Project *" id="proj-name" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="Project XYZ" />
            <Select label="Pilih Lead *" id="proj-lead" options={leads.map((l) => ({ value: l.id, label: `${l.name}${l.company ? ` (${l.company})` : ""}` }))} value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })} placeholder="Pilih lead..." />
          </div>
          <Textarea label="Catatan" id="proj-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan" />

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground-secondary">Produk / Layanan</p>
              <Button variant="outline" size="sm" onClick={addItem} className="text-xs">+ Tambah Produk</Button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const product = productMap.get(item.product_id);
                const isBelowPrice = product && item.negotiated_price < product.sell_price;
                return (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-lg border border-border bg-background-muted/30">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <Select
                        options={products.filter((p) => p.is_active).map((p) => ({ value: p.id, label: `${p.name} (${p.speed})` }))}
                        value={item.product_id}
                        onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                        placeholder="Pilih produk..."
                        className="sm:col-span-2"
                      />
                      <Input type="number" value={item.quantity || ""} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} placeholder="Qty" min={1} />
                      <Input
                        type="number"
                        value={item.negotiated_price || ""}
                        onChange={(e) => updateItem(idx, "negotiated_price", Number(e.target.value))}
                        placeholder="Harga nego"
                        error={isBelowPrice ? `Di bawah harga jual (${formatRupiah(product.sell_price)})` : undefined}
                      />
                    </div>
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="shrink-0 mt-0.5"><Trash2 className="w-3.5 h-3.5 text-error" /></Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total + Warning */}
          <div className="p-3 rounded-lg border border-border bg-background-muted">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Total Amount</span>
              <span className="text-lg font-bold text-brand">{formatRupiah(totalAmount)}</span>
            </div>
            {hasDiscountedItems && (
              <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "#d97706" }}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Terdapat harga di bawah harga jual — akan membutuhkan approval manager</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Buat Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal open={!!showApproval} onClose={() => setShowApproval(null)} title="Tolak Project" size="sm">
        <div className="space-y-4">
          <Textarea label="Alasan Penolakan" id="reject-reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Masukkan alasan..." />
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowApproval(null)}>Batal</Button>
            <Button variant="primary" size="sm" className="bg-error hover:bg-error/90" onClick={() => showApproval && handleApproval(showApproval, "reject")}>
              Tolak Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Hapus Project" size="sm">
        <p className="text-sm text-foreground-secondary">Yakin ingin menghapus project ini?</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" size="sm" onClick={() => setShowDelete(null)}>Batal</Button>
          <Button variant="primary" size="sm" className="bg-error hover:bg-error/90" onClick={() => showDelete && handleDelete(showDelete)}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
