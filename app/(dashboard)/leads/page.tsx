"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate, getLeadStatusConfig, getInitials, generateAvatarColor } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";
import { Plus, Search, Edit2, Trash2, Loader2, Download, ArrowUpDown, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { ColumnToggle, useColumnVisibility } from "@/components/ui/column-toggle";
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "new", label: "Prospek Baru" },
  { value: "contacted", label: "Follow Up" },
  { value: "qualified", label: "Prospek Valid" },
  { value: "proposal", label: "Kirim Penawaran" },
  { value: "negotiation", label: "Tahap Negosiasi" },
  { value: "won", label: "Deal Berhasil" },
  { value: "lost", label: "Deal Batal" },
];

const statusFormOptions = statusOptions.filter((s) => s.value !== "all");

const emptyForm = {
  name: "",
  company: "",
  contact: "",
  email: "",
  address: "",
  needs: "",
  status: "new" as LeadStatus,
};

export default function LeadsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterStatus, search]);

  // Column visibility
  const leadsColumns = [
    { key: "name", label: "Nama" },
    { key: "contact", label: "Kontak" },
    { key: "needs", label: "Kebutuhan" },
    { key: "status", label: "Status" },
    { key: "date", label: "Tanggal" },
    { key: "actions", label: "Aksi" },
  ];
  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility(leadsColumns);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (search) params.set("search", search);

    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    if (data.success) setLeads(data.data);
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setEditId(lead.id);
    setForm({
      name: lead.name,
      company: lead.company || "",
      contact: lead.contact,
      email: lead.email || "",
      address: lead.address || "",
      needs: lead.needs || "",
      status: lead.status,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.contact) {
      addToast("error", "Validasi", "Nama dan kontak wajib diisi");
      return;
    }
    setSaving(true);

    const url = editId ? `/api/leads/${editId}` : "/api/leads";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      addToast("success", editId ? "Lead diperbarui" : "Lead ditambahkan");
      setShowForm(false);
      fetchLeads();
    } else {
      addToast("error", "Gagal menyimpan lead");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Lead dihapus");
      setShowDelete(null);
      fetchLeads();
    } else {
      addToast("error", "Gagal menghapus lead");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Kelola calon pelanggan</p>
        </div>
        <Button variant="primary" size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="w-3.5 h-3.5" /> Tambah Lead
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Cari nama, perusahaan, kontak..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-background text-foreground rounded-[var(--radius)] border border-border outline-none placeholder:text-foreground-muted focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select
                options={statusOptions}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-[150px] sm:w-40"
              />
              <ColumnToggle columns={leadsColumns} visibleColumns={visibleColumns} onChange={toggleColumn} />
              <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-9 shrink-0">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-foreground-muted">Belum ada data lead</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {isVisible("name") && (
                        <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                          <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                            Nama <ArrowUpDown className="w-3 h-3 opacity-50" />
                          </div>
                        </th>
                      )}
                      {isVisible("contact") && (
                        <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                          <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                            Kontak <ArrowUpDown className="w-3 h-3 opacity-50" />
                          </div>
                        </th>
                      )}
                      {isVisible("needs") && (
                        <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden md:table-cell">Kebutuhan</th>
                      )}
                      {isVisible("status") && (
                        <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                          <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                            Status <ArrowUpDown className="w-3 h-3 opacity-50" />
                          </div>
                        </th>
                      )}
                      {isVisible("date") && (
                        <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                            Tanggal <ArrowUpDown className="w-3 h-3 opacity-50" />
                          </div>
                        </th>
                      )}
                      {isVisible("actions") && (
                        <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((lead) => {
                    const sc = getLeadStatusConfig(lead.status);
                    return (
                      <tr 
                        key={lead.id} 
                        onClick={() => router.push(`/leads/${lead.id}`)}
                        className="border-b border-border-light hover:bg-background-hover/50 transition-colors cursor-pointer"
                      >
                        {isVisible("name") && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: generateAvatarColor(lead.name) }}
                              >
                                {getInitials(lead.name)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{lead.name}</p>
                                <p className="text-xs text-foreground-muted">{lead.company || "—"}</p>
                              </div>
                            </div>
                          </td>
                        )}
                        {isVisible("contact") && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-foreground">{lead.contact}</p>
                                <p className="text-xs text-foreground-muted">{lead.email || "—"}</p>
                              </div>
                              {lead.contact && (
                                <a
                                  href={`https://wa.me/${lead.contact.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo ${lead.name}, saya dari PT. Smart. Apakah Anda tertarik dengan layanan internet kami?`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors hover:opacity-80"
                                  style={{ backgroundColor: "#25D366" }}
                                  title="Chat WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-3.5 h-3.5 text-white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          </td>
                        )}
                        {isVisible("needs") && (
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <p className="text-foreground-secondary truncate max-w-[200px]">{lead.needs || "—"}</p>
                          </td>
                        )}
                        {isVisible("status") && (
                          <td className="px-5 py-3.5">
                            <span
                              className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md"
                              style={{ backgroundColor: sc.bg, color: sc.color }}
                            >
                              {sc.label}
                            </span>
                          </td>
                        )}
                        {isVisible("date") && (
                          <td className="px-5 py-3.5 hidden lg:table-cell text-foreground-muted text-xs">
                            {formatDate(lead.created_at)}
                          </td>
                        )}
                        {isVisible("actions") && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(lead); }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowDelete(lead.id); }}>
                                <Trash2 className="w-3.5 h-3.5 text-error" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-background-muted/10">
                {leads.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((lead) => {
                  const sc = getLeadStatusConfig(lead.status);
                  return (
                    <Card key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="cursor-pointer shadow-sm border border-border bg-background hover:bg-background-hover/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ backgroundColor: generateAvatarColor(lead.name) }}
                            >
                              {getInitials(lead.name)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm text-foreground">{lead.name}</h3>
                              <p className="text-xs text-foreground-muted">{lead.company || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={(e) => { e.stopPropagation(); openEdit(lead); }}>
                              <Edit2 className="w-3.5 h-3.5 text-foreground-muted" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md hover:bg-error/10" onClick={(e) => { e.stopPropagation(); setShowDelete(lead.id); }}>
                              <Trash2 className="w-3.5 h-3.5 text-error" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-border-light">
                          <div>
                            <p className="text-[11px] text-foreground-muted mb-1 capitalize">Status</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                          </div>
                          <div>
                            <p className="text-[11px] text-foreground-muted mb-1 capitalize">Date</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(lead.created_at)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[11px] text-foreground-muted mb-1 capitalize">Contact</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{lead.contact} <span className="text-foreground-muted font-normal text-xs ml-1">{lead.email || ""}</span></p>
                              {lead.contact && (
                                <a
                                  href={`https://wa.me/${lead.contact.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo ${lead.name}, saya dari PT. Smart.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors hover:opacity-80"
                                  style={{ backgroundColor: "#25D366" }}
                                  title="Chat WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-3.5 h-3.5 text-white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
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
                Showing {leads.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-{Math.min(page * rowsPerPage, leads.length)} of {leads.length} results
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground-muted hidden sm:inline">Rows</span>
                  <select 
                    value={rowsPerPage} 
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    className="h-8 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-brand"
                  >
                    {[5, 10, 20, 50].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 h-8"
                  >
                    <ChevronLeft className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {Array.from({ length: Math.ceil(leads.length / rowsPerPage) || 1 }).map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? "primary" : "ghost"}
                        size="icon"
                        className="w-8 h-8 rounded-md text-xs"
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(Math.ceil(leads.length / rowsPerPage), p + 1))}
                    disabled={page >= Math.ceil(leads.length / rowsPerPage) || leads.length === 0}
                    className="px-2 h-8"
                  >
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Edit Lead" : "Tambah Lead Baru"}
        description={editId ? "Perbarui data calon pelanggan" : "Isi data calon pelanggan baru"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nama *" id="lead-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" />
            <Input label="Perusahaan" id="lead-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nama perusahaan" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Kontak (HP) *" id="lead-contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="08xxxxxxxxxx" />
            <Input label="Email" id="lead-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </div>
          <Textarea label="Alamat" id="lead-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" />
          <Textarea label="Kebutuhan" id="lead-needs" value={form.needs} onChange={(e) => setForm({ ...form, needs: e.target.value })} placeholder="Kebutuhan layanan internet" />
          <Select
            label="Status"
            id="lead-status"
            options={statusFormOptions}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {editId ? "Simpan Perubahan" : "Tambah Lead"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Hapus Lead" size="sm">
        <p className="text-sm text-foreground-secondary">Apakah Anda yakin ingin menghapus lead ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" size="sm" onClick={() => setShowDelete(null)}>Batal</Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-error hover:bg-error/90"
            onClick={() => showDelete && handleDelete(showDelete)}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
