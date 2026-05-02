"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatRupiah, calculateSellPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { Plus, Search, Edit2, Trash2, Loader2, Download, ArrowUpDown, ChevronLeft, ChevronRight, Wifi } from "lucide-react";
import { ColumnToggle, useColumnVisibility } from "@/components/ui/column-toggle";
import { exportToExcel } from "@/lib/export";
import { useRouter } from "next/navigation";

const emptyForm = { name: "", description: "", speed: "", hpp: 0, margin_percent: 0, is_active: true };

export default function ProductsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Column visibility
  const productColumns = [
    { key: "product", label: "Produk" },
    { key: "speed", label: "Kecepatan" },
    { key: "hpp", label: "HPP" },
    { key: "margin", label: "Margin" },
    { key: "sell_price", label: "Harga Jual" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Aksi" },
  ];
  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility(productColumns);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openNew = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description || "", speed: p.speed || "", hpp: p.hpp, margin_percent: p.margin_percent, is_active: p.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.hpp) { addToast("error", "Validasi", "Nama dan HPP wajib diisi"); return; }
    setSaving(true);
    const url = editId ? `/api/products/${editId}` : "/api/products";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { addToast("success", editId ? "Produk diperbarui" : "Produk ditambahkan"); setShowForm(false); fetchProducts(); }
    else addToast("error", "Gagal menyimpan produk");
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { addToast("success", "Produk dihapus"); setShowDelete(null); fetchProducts(); }
    else addToast("error", "Gagal menghapus produk");
  };

  const computedSellPrice = calculateSellPrice(Number(form.hpp), Number(form.margin_percent));

  // Pagination & Filtering Logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
    (p.speed && p.speed.toLowerCase().includes(search.toLowerCase()))
  );
  const paginatedProducts = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExport = () => {
    const dataToExport = filteredProducts.map((p, i) => ({
      No: i + 1,
      Produk: p.product_name,
      Kecepatan: p.speed,
      HPP: Number(p.base_price),
      Margin: p.margin_percent + "%",
      "Harga Jual": Number(p.sell_price),
      Deskripsi: p.description || "-"
    }));
    exportToExcel(dataToExport, "Data_Produk", "Produk");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Master Produk</h1>
          <p className="text-sm text-foreground-muted mt-0.5">Paket layanan internet</p>
        </div>
        <Button variant="primary" size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="w-3.5 h-3.5" /> Tambah Produk
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
                placeholder="Cari produk, deskripsi, atau kecepatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-background text-foreground rounded-[var(--radius)] border border-border outline-none placeholder:text-foreground-muted focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <ColumnToggle columns={productColumns} visibleColumns={visibleColumns} onChange={toggleColumn} />
              <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-9" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16"><p className="text-sm text-foreground-muted">Belum ada produk</p></div>
          ) : (
            <div className="flex flex-col">
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {isVisible("product") && (
                        <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                          <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                            Produk <ArrowUpDown className="w-3 h-3 opacity-50" />
                          </div>
                        </th>
                      )}
                      {isVisible("speed") && (
                        <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden md:table-cell">Kecepatan</th>
                      )}
                      {isVisible("hpp") && (
                        <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">HPP</th>
                      )}
                      {isVisible("margin") && (
                        <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Margin</th>
                      )}
                      {isVisible("sell_price") && (
                        <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Harga Jual</th>
                      )}
                      {isVisible("status") && (
                        <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">Status</th>
                      )}
                      {isVisible("actions") && (
                        <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => router.push(`/products/${p.id}`)}
                      className="border-b border-border-light hover:bg-background-hover/50 transition-colors cursor-pointer"
                    >
                      {isVisible("product") && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-background-muted border border-border flex items-center justify-center shrink-0">
                              <Wifi className="w-4 h-4 text-foreground-secondary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-foreground-muted truncate max-w-[200px]">{p.description || "—"}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      {isVisible("speed") && (
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide rounded-md bg-background-card border border-border text-foreground">
                            {p.speed || "—"}
                          </span>
                        </td>
                      )}
                      {isVisible("hpp") && (
                        <td className="px-5 py-3.5 text-right font-medium text-foreground">{formatRupiah(Number(p.hpp))}</td>
                      )}
                      {isVisible("margin") && (
                        <td className="px-5 py-3.5 text-right font-medium text-foreground">{p.margin_percent}%</td>
                      )}
                        <td className="px-5 py-3.5 text-right font-semibold text-foreground">{formatRupiah(Number(p.sell_price))}</td>
                      {isVisible("status") && (
                        <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                          <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md" style={{ backgroundColor: p.is_active ? "#16a34a" : "#dc2626", color: "#ffffff" }}>
                            {p.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                      )}
                      {isVisible("actions") && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(p); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowDelete(p.id); }}><Trash2 className="w-3.5 h-3.5 text-error" /></Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-background-muted/10">
                {paginatedProducts.map((p) => (
                  <Card key={p.id} onClick={() => router.push(`/products/${p.id}`)} className="cursor-pointer shadow-sm border border-border bg-background hover:bg-background-hover/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 min-w-0 pr-2">
                          <div className="w-10 h-10 rounded-lg bg-background-muted border border-border flex items-center justify-center shrink-0">
                            <Wifi className="w-5 h-5 text-foreground-secondary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate">{p.name}</h3>
                            <p className="text-xs text-foreground-muted truncate">{p.description || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                            <Edit2 className="w-3.5 h-3.5 text-foreground-muted" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md hover:bg-error/10" onClick={(e) => { e.stopPropagation(); setShowDelete(p.id); }}>
                            <Trash2 className="w-3.5 h-3.5 text-error" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-border-light">
                        <div>
                          <p className="text-[11px] text-foreground-muted mb-1.5 capitalize">Speed</p>
                          <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide rounded-md bg-background-card border border-border text-foreground">
                            {p.speed || "—"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] text-foreground-muted mb-1.5 capitalize">Status</p>
                          <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md" style={{ backgroundColor: p.is_active ? "#16a34a" : "#dc2626", color: "#ffffff" }}>
                            {p.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] text-foreground-muted mb-1 capitalize">HPP</p>
                          <p className="text-sm font-medium text-foreground">{formatRupiah(Number(p.hpp))}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-foreground-muted mb-1 capitalize">Harga Jual</p>
                          <p className="text-sm font-semibold text-foreground">{formatRupiah(Number(p.sell_price))}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-border gap-4 bg-background-muted/20">
              <div className="text-sm text-foreground-muted text-center sm:text-left">
                Showing {filteredProducts.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-{Math.min(page * rowsPerPage, filteredProducts.length)} of {filteredProducts.length} results
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
                    {Array.from({ length: Math.ceil(filteredProducts.length / rowsPerPage) || 1 }).map((_, i) => (
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
                    onClick={() => setPage(p => Math.min(Math.ceil(filteredProducts.length / rowsPerPage), p + 1))}
                    disabled={page >= Math.ceil(filteredProducts.length / rowsPerPage) || filteredProducts.length === 0}
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
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Produk" : "Tambah Produk Baru"} size="md">
        <div className="space-y-4">
          <Input label="Nama Paket *" id="prod-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Paket Home 50" />
          <Textarea label="Deskripsi" id="prod-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi paket" />
          <Input label="Kecepatan" id="prod-speed" value={form.speed} onChange={(e) => setForm({ ...form, speed: e.target.value })} placeholder="50 Mbps" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="HPP (Rp) *" id="prod-hpp" type="number" value={form.hpp || ""} onChange={(e) => setForm({ ...form, hpp: Number(e.target.value) })} placeholder="0" />
            <Input label="Margin (%)" id="prod-margin" type="number" value={form.margin_percent || ""} onChange={(e) => setForm({ ...form, margin_percent: Number(e.target.value) })} placeholder="0" />
          </div>
          {/* Calculated sell price */}
          <div className="p-3 rounded-lg border border-border bg-background-muted">
            <p className="text-xs text-foreground-muted">Harga Jual (otomatis)</p>
            <p className="text-lg font-bold text-brand">{formatRupiah(computedSellPrice)}</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="prod-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <label htmlFor="prod-active" className="text-sm text-foreground-secondary cursor-pointer">Produk aktif</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {editId ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Hapus Produk" size="sm">
        <p className="text-sm text-foreground-secondary">Apakah Anda yakin ingin menghapus produk ini?</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" size="sm" onClick={() => setShowDelete(null)}>Batal</Button>
          <Button variant="primary" size="sm" className="bg-error hover:bg-error/90" onClick={() => showDelete && handleDelete(showDelete)}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
