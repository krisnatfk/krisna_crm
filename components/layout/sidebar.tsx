"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { navSections } from "@/lib/data";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard, BarChart3, Users, UserPlus, UserCheck,
  Package, FolderKanban, ChevronLeft, ChevronDown, LogOut, Wifi, History, Settings
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, BarChart3, Users, UserPlus, UserCheck,
  Package, FolderKanban, History, Settings
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    OVERVIEW: true,
    SALES: true,
    MANAGEMENT: true,
    SYSTEM: true,
  });

  const toggleSection = (title: string) => {
    if (collapsed) return;
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {/* Latar Belakang Overlay untuk Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "md:w-[72px]" : "md:w-[260px]",
          "md:translate-x-0",
          "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ backgroundColor: "oklch(0.145 0 0)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b shrink-0" style={{ borderColor: "oklab(0.87 -0.003 -0.004 / 0.15)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-[15px] font-bold tracking-tight text-white">PT. Smart</h1>
              <p className="text-[10px] font-medium tracking-widest uppercase"
                 style={{ color: "oklab(0.87 -0.003 -0.004 / 0.45)" }}>
                CRM System
              </p>
            </div>
          )}
        </div>

        {/* Tombol Toggle - Sembunyi di mobile */}
        <button
          onClick={onToggle}
          className={cn(
            "hidden md:flex absolute top-[88px] -right-3 z-50 w-6 h-6 rounded-full",
            "bg-white dark:bg-[oklch(0.25_0_0)] border border-border",
            "items-center justify-center",
            "shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          )}
        >
          <ChevronLeft
            className={cn(
              "w-3.5 h-3.5 text-foreground-secondary transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>

        {/* Navigasi Utama */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-3">
          {navSections.map((section) => {
            const isOpen = openSections[section.title] ?? true;

            return (
              <div key={section.title} className="mb-1">
                {/* Header Grup Menu */}
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2.5 cursor-pointer group"
                  >
                    <p
                      className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                      style={{ color: "oklab(0.87 -0.003 -0.004 / 0.4)" }}
                    >
                      {section.title}
                    </p>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        !isOpen && "-rotate-90"
                      )}
                      style={{ color: "oklab(0.87 -0.003 -0.004 / 0.3)" }}
                    />
                  </button>
                )}

                {/* Daftar Menu */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    !collapsed && !isOpen && "max-h-0 opacity-0",
                    (!collapsed && isOpen || collapsed) && "max-h-[500px] opacity-100"
                  )}
                >
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = iconMap[item.icon] || LayoutDashboard;
                      const isActive = pathname === item.href;
                      const isHovered = hoveredItem === item.label;

                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (onMobileClose) onMobileClose();
                            }}
                            onMouseEnter={() => setHoveredItem(item.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={cn(
                              "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              collapsed && "justify-center px-2"
                            )}
                            style={{
                              backgroundColor: isActive
                                ? "oklch(0.2 0 0)"
                                : isHovered
                                  ? "oklch(0.2 0 0 / 0.5)"
                                  : "transparent",
                              color: isActive
                                ? "oklch(0.6 0.175 160)"
                                : isHovered
                                  ? "oklch(0.6 0.175 160)"
                                  : "oklab(0.87 -0.003 -0.004 / 0.7)",
                            }}
                          >
                            <Icon
                              className={cn(
                                "w-[18px] h-[18px] shrink-0 transition-transform duration-200",
                                (isActive || isHovered) && "scale-110"
                              )}
                            />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                  <span
                                    className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md"
                                    style={{
                                      backgroundColor: isActive
                                        ? "oklch(0.6 0.175 160 / 0.15)"
                                        : "oklch(0.6 0.175 160 / 0.12)",
                                      color: "oklch(0.6 0.175 160)",
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Profil Pengguna Bawah */}
        {!collapsed && (
          <div className="p-3 border-t shrink-0" style={{ borderColor: "oklab(0.87 -0.003 -0.004 / 0.15)" }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user ? getInitials(user.name) : ".."}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "Loading..."}
                </p>
                <p
                  className="text-[11px] -mt-0.5 capitalize"
                  style={{ color: "oklab(0.87 -0.003 -0.004 / 0.45)" }}
                >
                  {user?.role || "—"}
                </p>
              </div>
              <button
                onClick={logout}
                className="cursor-pointer transition-colors hover:opacity-80"
                title="Logout"
              >
                <LogOut
                  className="w-4 h-4 transition-colors"
                  style={{ color: "oklab(0.87 -0.003 -0.004 / 0.4)" }}
                />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
