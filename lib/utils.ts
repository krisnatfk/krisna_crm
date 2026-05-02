import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LeadStatus, ProjectStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(value >= 10000 ? 0 : 1) + "K";
  }
  return value.toLocaleString("id-ID");
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateSellPrice(hpp: number, marginPercent: number): number {
  if (!hpp) return 0;
  return hpp + (hpp * (marginPercent || 0)) / 100;
}

export function getLeadStatusConfig(status: LeadStatus): {
  label: string;
  color: string;
  bg: string;
} {
  const configs: Record<LeadStatus, { label: string; color: string; bg: string }> = {
    new: { label: "Prospek Baru", color: "#ffffff", bg: "#f59e0b" },
    contacted: { label: "Follow Up", color: "#ffffff", bg: "#3b82f6" },
    qualified: { label: "Prospek Valid", color: "#ffffff", bg: "#0f766e" },
    proposal: { label: "Kirim Penawaran", color: "#ffffff", bg: "#8b5cf6" },
    negotiation: { label: "Tahap Negosiasi", color: "#ffffff", bg: "#0f766e" },
    won: { label: "Deal Berhasil", color: "#ffffff", bg: "#16a34a" },
    lost: { label: "Deal Batal", color: "#ffffff", bg: "#dc2626" },
  };
  return configs[status];
}

export function getProjectStatusConfig(status: ProjectStatus): {
  label: string;
  color: string;
  bg: string;
} {
  const configs: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
    waiting_approval: { label: "Menunggu Persetujuan", color: "#ffffff", bg: "#d97706" },
    approved: { label: "Disetujui", color: "#ffffff", bg: "#16a34a" },
    rejected: { label: "Ditolak", color: "#ffffff", bg: "#dc2626" },
  };
  return configs[status];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateAvatarColor(name: string): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16",
    "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
