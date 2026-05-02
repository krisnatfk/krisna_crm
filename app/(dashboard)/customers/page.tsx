"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate, getInitials, generateAvatarColor } from "@/lib/utils";
import { Search, Loader2, Wifi, Download, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

interface CustomerService {
  id: string;
  product_id: string;
  price: number;
  start_date: string;
  status: "active" | "inactive";
}

interface CustomerData {
  id: string;
  name: string;
  company?: string;
  contact: string;
  email?: string;
  address?: string;
  created_at: string;
  services: CustomerService[];
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { setPage(1); }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    if (data.success) setCustomers(data.data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter and Paginate
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
    c.contact.includes(search)
  );
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pelanggan Aktif</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Daftar pelanggan yang sudah berlangganan</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Cari pelanggan, perusahaan, kontak..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-background text-foreground rounded-[var(--radius)] border border-border outline-none placeholder:text-foreground-muted focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-9">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16"><p className="text-sm text-foreground-muted">Belum ada pelanggan</p></div>
          ) : (
            <div className="flex flex-col">
              {/* Desktop Table View */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Pelanggan</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Kontak</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">Perusahaan</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Layanan</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total/bln</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((cust) => {
                      const activeServices = cust.services?.filter((s) => s.status === "active") || [];
                      const totalMonthly = activeServices.reduce((sum, s) => sum + Number(s.price), 0);

                      return (
                        <tr
                          key={cust.id}
                          onClick={() => router.push(`/customers/${cust.id}`)}
                          className="border-b border-border-light hover:bg-background-hover/50 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: generateAvatarColor(cust.name) }}
                              >
                                {getInitials(cust.name)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{cust.name}</p>
                                <p className="text-xs text-foreground-muted">{cust.email || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground">{cust.contact}</span>
                              {cust.contact && (
                                <a
                                  href={`https://wa.me/${cust.contact.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo ${cust.name}, terima kasih telah berlangganan layanan PT. Smart.`)}`}
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
                          <td className="px-5 py-3.5 text-foreground-muted hidden lg:table-cell">{cust.company || "—"}</td>
                          <td className="px-5 py-3.5 text-center font-medium text-foreground">{activeServices.length}</td>
                          <td className="px-5 py-3.5 text-right font-bold text-foreground">{formatRupiah(totalMonthly)}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md" style={{ backgroundColor: activeServices.length > 0 ? "#16a34a" : "#dc2626", color: "#ffffff" }}>
                              {activeServices.length > 0 ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-background-muted/10">
                {paginatedCustomers.map((cust) => {
                  const activeServices = cust.services?.filter((s) => s.status === "active") || [];
                  const totalMonthly = activeServices.reduce((sum, s) => sum + Number(s.price), 0);

                  return (
                    <Card
                      key={cust.id}
                      onClick={() => router.push(`/customers/${cust.id}`)}
                      className="cursor-pointer shadow-sm border border-border bg-background hover:bg-background-hover/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ backgroundColor: generateAvatarColor(cust.name) }}
                            >
                              {getInitials(cust.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{cust.name}</p>
                              <p className="text-xs text-foreground-muted">{cust.email || cust.contact || "—"}</p>
                            </div>
                          </div>
                          {cust.contact && (
                            <a
                              href={`https://wa.me/${cust.contact.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo ${cust.name}, terima kasih telah berlangganan layanan PT. Smart.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors hover:opacity-80"
                              style={{ backgroundColor: "#25D366" }}
                              title="Chat WhatsApp"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4 text-white">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                              </svg>
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-border-light">
                          <div>
                            <p className="text-[11px] text-foreground-muted mb-1">Status</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: activeServices.length > 0 ? "#16a34a" : "#dc2626", color: "#ffffff" }}>
                              {activeServices.length > 0 ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>
                          <div>
                            <p className="text-[11px] text-foreground-muted mb-1">Bergabung</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(cust.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-foreground-muted mb-1">Layanan Aktif</p>
                            <p className="text-sm font-medium text-foreground">{activeServices.length}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-foreground-muted mb-1">Total/bulan</p>
                            <p className="text-sm font-bold text-foreground">{formatRupiah(totalMonthly)}</p>
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
                  Showing {filteredCustomers.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-{Math.min(page * rowsPerPage, filteredCustomers.length)} of {filteredCustomers.length} results
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
                      {Array.from({ length: totalPages }).map((_, i) => (
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
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || filteredCustomers.length === 0}
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
    </div>
  );
}
