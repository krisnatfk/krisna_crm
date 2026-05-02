"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah } from "@/lib/utils";
import { Loader2, ArrowLeft, Pencil, Trash2, Box, Wifi, DollarSign, Activity, Calendar } from "lucide-react";
import Link from "next/link";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  speed: string | null;
  hpp: number;
  margin_percent: number;
  sell_price: number;
  is_active: boolean;
  created_at: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
      } else {
        router.push("/products");
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand transition-colors">Produk</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            {product.name}
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md uppercase" style={{ backgroundColor: product.is_active ? "#16a34a" : "#ef4444", color: "#ffffff" }}>
              {product.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </h1>
          <p className="text-sm text-foreground-muted mt-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Ditambahkan pada {formatDate(product.created_at)}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="gap-2 bg-background-card hover:bg-background-hover">
            <Pencil className="w-4 h-4" /> Edit
          </Button>
          <Button variant="primary" className="gap-2 bg-error hover:bg-error/90 text-white shadow-none border-0">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Product Details Card */}
        <Card className="col-span-1 md:col-span-2 shadow-sm border border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Box className="w-4 h-4 text-foreground-muted" /> Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Product Name</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0">{product.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Speed</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0 flex items-center gap-2">
                  {product.speed ? (
                    <>
                      <Wifi className="w-4 h-4 text-foreground-muted hidden sm:block" />
                      {product.speed}
                    </>
                  ) : "—"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Description</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0 sm:text-right max-w-sm">
                  {product.description || "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Status Card */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-foreground-muted" /> Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="flex justify-between items-center p-4 px-5">
                  <span className="text-sm text-foreground-muted">Harga Pokok (HPP)</span>
                  <span className="text-sm font-medium text-foreground">{formatRupiah(product.hpp)}</span>
                </div>
                <div className="flex justify-between items-center p-4 px-5">
                  <span className="text-sm text-foreground-muted">Margin Keuntungan</span>
                  <span className="text-sm font-medium text-success">+{product.margin_percent}%</span>
                </div>
                <div className="flex justify-between items-center p-4 px-5 bg-background-muted/30">
                  <span className="text-sm font-semibold text-foreground">Harga Jual</span>
                  <span className="text-base font-bold text-brand">{formatRupiah(product.sell_price)}</span>
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
                 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: product.is_active ? "#dcfce7" : "#fee2e2" }}>
                   <Box className="w-5 h-5" style={{ color: product.is_active ? "#16a34a" : "#ef4444" }} />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-foreground">{product.is_active ? "Produk Aktif" : "Produk Nonaktif"}</p>
                   <p className="text-xs text-foreground-muted mt-0.5">{product.is_active ? "Dapat dipilih oleh tim sales." : "Disembunyikan dari pilihan."}</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
