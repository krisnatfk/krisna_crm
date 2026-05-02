"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah, getInitials, generateAvatarColor } from "@/lib/utils";
import { Loader2, ArrowLeft, Pencil, Trash2, User, Wifi, Phone, Mail, MapPin, Calendar, Building, Activity } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface ServiceData {
  id: string;
  product_id: string;
  price: number;
  start_date: string;
  status: "active" | "inactive";
}

interface ProductData {
  id: string;
  name: string;
  speed: string | null;
}

interface CustomerDetail {
  id: string;
  name: string;
  company?: string;
  contact: string;
  email?: string;
  address?: string;
  created_at: string;
  services: ServiceData[];
  products: ProductData[];
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  
  const [form, setForm] = useState({
    name: "", company: "", contact: "", email: "", address: ""
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
        setForm({
          name: data.data.name,
          company: data.data.company || "",
          contact: data.data.contact,
          email: data.data.email || "",
          address: data.data.address || ""
        });
      } else {
        router.push("/customers");
      }
      setLoading(false);
    };
    fetchCustomer();
  }, [id, router]);

  const handleEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      addToast("success", "Pelanggan berhasil diperbarui");
      setCustomer((prev) => prev ? { ...prev, ...form } : prev);
      setShowEdit(false);
    } else {
      addToast("error", "Gagal memperbarui pelanggan");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Pelanggan dihapus");
      router.push("/customers");
    } else {
      addToast("error", "Gagal menghapus pelanggan");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!customer) return null;

  const activeServices = customer.services?.filter((s) => s.status === "active") || [];
  const totalMonthly = activeServices.reduce((sum, s) => sum + Number(s.price), 0);
  const productMap = new Map(customer.products?.map((p) => [p.id, p]) || []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/customers" className="hover:text-brand transition-colors">Pelanggan</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{customer.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ backgroundColor: generateAvatarColor(customer.name) }}
          >
            {getInitials(customer.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {customer.name}
              <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md uppercase" style={{ backgroundColor: activeServices.length > 0 ? "#16a34a" : "#ef4444", color: "#ffffff" }}>
                {activeServices.length > 0 ? "Aktif" : "Nonaktif"}
              </span>
            </h1>
            <p className="text-sm text-foreground-muted mt-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Bergabung sejak {formatDate(customer.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="gap-2 bg-background-card hover:bg-background-hover" onClick={() => setShowEdit(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
          <Button variant="primary" className="gap-2 bg-error hover:bg-error/90 text-white shadow-none border-0" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Customer Info Card */}
        <Card className="col-span-1 md:col-span-2 shadow-sm border border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-foreground-muted" /> Informasi Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted flex items-center gap-2"><User className="w-4 h-4" /> Nama</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0">{customer.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted flex items-center gap-2"><Building className="w-4 h-4" /> Perusahaan</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0">{customer.company || "—"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted flex items-center gap-2"><Phone className="w-4 h-4" /> Telepon</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0">{customer.contact}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0">{customer.email || "—"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted flex items-center gap-2"><MapPin className="w-4 h-4" /> Alamat</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0 sm:text-right max-w-sm">{customer.address || "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-foreground-muted" /> Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="flex justify-between items-center p-4 px-5">
                  <span className="text-sm text-foreground-muted">Layanan Aktif</span>
                  <span className="text-sm font-bold text-foreground">{activeServices.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 px-5">
                  <span className="text-sm text-foreground-muted">Total Layanan</span>
                  <span className="text-sm font-medium text-foreground">{customer.services?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 px-5 bg-background-muted/30">
                  <span className="text-sm font-semibold text-foreground">Total/bulan</span>
                  <span className="text-base font-bold text-brand">{formatRupiah(totalMonthly)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-foreground-muted" /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: activeServices.length > 0 ? "#16a34a" : "#dc2626" }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{activeServices.length > 0 ? "Pelanggan Aktif" : "Pelanggan Nonaktif"}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">{activeServices.length > 0 ? "Memiliki layanan yang sedang berjalan." : "Tidak memiliki layanan aktif."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services List */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="w-4 h-4 text-foreground-muted" /> Daftar Layanan ({customer.services?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!customer.services || customer.services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-foreground-muted">Belum ada layanan</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {customer.services.map((svc) => {
                const product = productMap.get(svc.product_id);
                return (
                  <div key={svc.id} className="flex items-center gap-4 p-4 px-5 hover:bg-background-hover/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#3b82f6" }}>
                      <Wifi className="w-5 h-5" style={{ color: "#ffffff" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{product?.name || "Unknown"}</p>
                      <p className="text-xs text-foreground-muted">{product?.speed || "—"} • Mulai: {formatDate(svc.start_date)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatRupiah(Number(svc.price))}<span className="text-xs text-foreground-muted font-normal">/bln</span></p>
                      <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md mt-0.5 inline-block" style={{ backgroundColor: svc.status === "active" ? "#16a34a" : "#dc2626", color: "#ffffff" }}>
                        {svc.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Pelanggan">
        <div className="space-y-4">
          <Input label="Nama Lengkap *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Perusahaan" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input label="Kontak / Telepon *" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setShowEdit(false)}>Batal</Button>
            <Button variant="primary" onClick={handleEdit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Hapus Pelanggan" size="sm">
        <p className="text-sm text-foreground-secondary mb-4">Apakah Anda yakin ingin menghapus pelanggan <strong>{customer.name}</strong>? Semua layanan terkait akan ikut terhapus.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDelete(false)}>Batal</Button>
          <Button variant="primary" className="bg-error hover:bg-error/90" onClick={handleDelete} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
