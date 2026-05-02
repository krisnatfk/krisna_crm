"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials, generateAvatarColor } from "@/lib/utils";
import { Loader2, ArrowLeft, Pencil, Trash2, Building2, User, Mail, MapPin, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";

interface LeadData {
  id: string;
  name: string;
  company: string | null;
  contact: string;
  email: string | null;
  address: string | null;
  needs: string | null;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  created_at: string;
}

const statusConfig = {
  new: { label: "Prospek Baru", bg: "#f59e0b", color: "#ffffff" },
  contacted: { label: "Dihubungi", bg: "#3b82f6", color: "#ffffff" },
  qualified: { label: "Prospek Valid", bg: "#10b981", color: "#ffffff" },
  proposal: { label: "Proposal Dikirim", bg: "#8b5cf6", color: "#ffffff" },
  negotiation: { label: "Negosiasi", bg: "#f97316", color: "#ffffff" },
  won: { label: "Goal (Menang)", bg: "#16a34a", color: "#ffffff" },
  lost: { label: "Gagal (Kalah)", bg: "#ef4444", color: "#ffffff" },
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      if (data.success) {
        setLead(data.data);
      } else {
        router.push("/leads");
      }
      setLoading(false);
    };
    fetchLead();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!lead) return null;

  const sc = statusConfig[lead.status] || statusConfig.new;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/leads" className="hover:text-brand transition-colors">Leads</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{lead.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            {lead.name}
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md uppercase" style={{ backgroundColor: sc.bg, color: sc.color }}>
              {sc.label}
            </span>
          </h1>
          <p className="text-sm text-foreground-muted mt-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Added on {formatDate(lead.created_at)}
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
        {/* Lead Details Card */}
        <Card className="col-span-1 md:col-span-2 shadow-sm border border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-foreground-muted" /> Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Full Name</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0">{lead.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Company</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0 flex items-center gap-2">
                  {lead.company ? (
                    <>
                      <Building2 className="w-4 h-4 text-foreground-muted hidden sm:block" />
                      {lead.company}
                    </>
                  ) : "—"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Phone Number</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0">{lead.contact}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Email Address</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0 flex items-center gap-2">
                  {lead.email ? (
                    <>
                      <Mail className="w-4 h-4 text-foreground-muted hidden sm:block" />
                      {lead.email}
                    </>
                  ) : "—"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 hover:bg-background-hover/30 transition-colors">
                <span className="text-sm text-foreground-muted">Address</span>
                <span className="text-sm font-medium text-foreground mt-1 sm:mt-0 text-right max-w-xs truncate flex items-center justify-end gap-2">
                  {lead.address ? (
                    <>
                      <MapPin className="w-4 h-4 text-foreground-muted hidden sm:block shrink-0" />
                      <span className="truncate">{lead.address}</span>
                    </>
                  ) : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Avatar Card */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-foreground-muted" /> Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Customer Needs</p>
                <div className="bg-background-muted p-4 rounded-lg border border-border/50 text-sm text-foreground">
                  {lead.needs ? lead.needs : <span className="italic text-foreground-muted">No specific requirements mentioned.</span>}
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                 <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Profile</p>
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-inner" style={{ backgroundColor: generateAvatarColor(lead.name) }}>
                     {getInitials(lead.name)}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-foreground">{lead.name}</p>
                     <p className="text-xs text-foreground-muted mt-0.5">Sales Lead</p>
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
