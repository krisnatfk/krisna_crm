import type { NavSectionType } from "@/types";

export const navSections: NavSectionType[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", active: true },
    ],
  },
  {
    title: "SALES",
    items: [
      { label: "Leads", href: "/leads", icon: "UserPlus" },
      { label: "Produk", href: "/products", icon: "Package" },
      { label: "Projects", href: "/projects", icon: "FolderKanban" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Pelanggan", href: "/customers", icon: "UserCheck" },
      { label: "Laporan", href: "/reporting", icon: "BarChart3" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Activity Log", href: "/activity-log", icon: "History" },
      { label: "Pengaturan", href: "/settings", icon: "Settings" },
    ],
  },
];
