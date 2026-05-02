"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { getInitials } from "@/lib/utils";
import {
  Search, Moon, Sun, Bell, Settings, LogOut, FolderKanban, Users, Menu, Clock,
  Check, CheckCheck, Plus, Edit2, Trash2, X, FileDown, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps {
  collapsed: boolean;
  onMobileMenuToggle?: () => void;
}

export function Header({ collapsed, onMobileMenuToggle }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("crm_last_read_notif");
    if (saved) {
      setLastReadTime(parseInt(saved, 10));
    }
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    setNotifsLoading(true);
    try {
      const res = await fetch("/api/activity-logs?limit=5");
      const data = await res.json();
      if (data.success) {
        setNotifs(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setNotifsLoading(false);
  };

  const markAllRead = () => {
    const now = Date.now();
    setLastReadTime(now);
    localStorage.setItem("crm_last_read_notif", now.toString());
  };

  const unreadCount = notifs.filter(n => new Date(n.created_at).getTime() > lastReadTime).length;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search Modal State & Shortcut
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isSearchOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center px-4 md:px-6 transition-all duration-300",
        "ml-0 md:ml-[260px]",
        collapsed && "md:ml-[72px]"
      )}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden mr-2 text-foreground-muted hover:text-foreground"
        onClick={onMobileMenuToggle}
      >
        <Menu className="w-5 h-5" />
      </Button>
      {/* Search Bar — desktop only */}
      <div className="flex-1 hidden md:block">
        <div className="relative max-w-md">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between h-9 pl-3 pr-2 text-sm bg-background-muted hover:bg-background-hover text-foreground-muted rounded-[var(--radius)] border border-transparent hover:border-border transition-all cursor-text text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 opacity-50" />
              <span>Search anything...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 opacity-70">
              <kbd className="inline-flex h-5 items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-foreground-muted bg-background border border-border rounded">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </button>
        </div>
      </div>
      {/* Mobile spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground-muted hover:text-foreground"
          onClick={toggleTheme}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground-muted hover:text-foreground relative"
            onClick={() => setShowNotif(!showNotif)}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full border border-background"></span>
            )}
          </Button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-[380px] bg-background-card rounded-xl shadow-[var(--shadow-lg)] border border-border z-50 animate-scale-in overflow-hidden flex flex-col max-h-[500px]">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-brand/10 text-brand text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button 
                  onClick={markAllRead}
                  className="text-[13px] text-foreground-muted hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {notifsLoading ? (
                  <div className="p-6 text-center">
                    <span className="text-sm text-foreground-muted">Memuat...</span>
                  </div>
                ) : notifs.length === 0 ? (
                  <div className="p-6 text-center">
                    <span className="text-sm text-foreground-muted">Belum ada aktivitas</span>
                  </div>
                ) : (
                  notifs.map(n => {
                    const isUnread = new Date(n.created_at).getTime() > lastReadTime;
                    
                    const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string; title: string }> = {
                      created: { icon: Plus, color: "#16a34a", bg: "#dcfce7", label: "membuat", title: "New created" },
                      updated: { icon: Edit2, color: "#2563eb", bg: "#dbeafe", label: "memperbarui", title: "Update processed" },
                      deleted: { icon: Trash2, color: "#dc2626", bg: "#fee2e2", label: "menghapus", title: "Item deleted" },
                      approved: { icon: CheckCircle2, color: "#16a34a", bg: "#dcfce7", label: "menyetujui", title: "Approval processed" },
                      rejected: { icon: X, color: "#dc2626", bg: "#fee2e2", label: "menolak", title: "Item rejected" },
                      exported: { icon: FileDown, color: "#8b5cf6", bg: "#ede9fe", label: "mengekspor", title: "Export completed" },
                    };
                    const config = actionConfig[n.action] || actionConfig.created;
                    const ActionIcon = config.icon;
                    const actionLabel = config.label;
                    
                    let title = config.title;
                    if (n.entity_type === "lead" && n.action === "created") title = "New lead signup";
                    else if (n.entity_type === "project" && n.action === "approved") title = "Project approved";
                    
                    // Time ago
                    const diffMs = Date.now() - new Date(n.created_at).getTime();
                    const diffMin = Math.floor(diffMs / 60000);
                    const diffHr = Math.floor(diffMin / 60);
                    const diffDay = Math.floor(diffHr / 24);
                    const timeAgo = diffDay > 0 ? `${diffDay}h ago` : diffHr > 0 ? `${diffHr}h ago` : diffMin > 0 ? `${diffMin}m ago` : "Just now";

                    return (
                      <div key={n.id} className={cn(
                        "px-4 py-3 border-b border-border-light hover:bg-background-hover transition-colors flex gap-3 relative",
                        isUnread && "bg-brand/5"
                      )}>
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: config.bg }}
                        >
                          <ActionIcon className="w-4 h-4" style={{ color: config.color }} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-semibold text-foreground mb-0.5">
                            {title}
                          </p>
                          <p className="text-[13px] text-foreground-secondary leading-snug">
                            {n.user_name} {actionLabel} {n.entity_type} {n.entity_name ? `"${n.entity_name}"` : ""}
                          </p>
                          <p className="text-[11px] text-foreground-muted mt-1.5 font-medium">{timeAgo}</p>
                        </div>
                        {isUnread && (
                          <div className="absolute right-4 top-5 w-2 h-2 rounded-full bg-brand"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-2 bg-background border-t border-border">
                <Link 
                  href="/activity-log" 
                  className="block w-full text-center py-2 text-[13px] font-medium text-brand hover:bg-brand/5 rounded-md transition-colors"
                  onClick={() => setShowNotif(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + Profile Dropdown */}
        <div className="relative ml-2" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 hover:ring-brand/30 transition-all overflow-hidden"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : user ? getInitials(user.name) : ".."}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-background-card rounded-xl shadow-[var(--shadow-lg)] border border-border z-50 py-1.5 animate-scale-in overflow-hidden">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-foreground-muted mt-0.5">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-md capitalize bg-background-muted text-foreground-secondary border border-border">
                  {user?.role}
                </span>
              </div>

              {/* Settings */}
              <div className="py-1 border-b border-border">
                <Link
                  href="/settings"
                  onClick={() => setShowProfile(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-secondary hover:bg-background-muted hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan Profil
                </Link>
              </div>

              {/* Log out */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-secondary hover:bg-background-muted hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal (Command Palette) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32 px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsSearchOpen(false)} />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-background-card rounded-xl shadow-[var(--shadow-lg)] border border-border overflow-hidden animate-scale-in">
            {/* Search Input Header */}
            <div className="flex items-center px-4 border-b border-border">
              <Search className="w-5 h-5 text-foreground-muted shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                className="w-full h-14 bg-transparent border-0 outline-none px-3 text-base text-foreground placeholder:text-foreground-muted"
              />
              <kbd className="hidden sm:inline-flex h-6 items-center gap-1 px-2 font-mono text-[10px] font-medium text-foreground-muted bg-background border border-border rounded cursor-pointer hover:bg-background-hover" onClick={() => setIsSearchOpen(false)}>
                ESC
              </kbd>
            </div>
            
            {/* Results Area */}
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              <div className="px-2 py-1.5 text-xs font-semibold text-foreground-muted tracking-wider">QUICK ACTIONS</div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-background-hover rounded-lg cursor-pointer transition-colors" onClick={() => { setIsSearchOpen(false); router.push("/projects"); }}>
                <FolderKanban className="w-4 h-4 text-brand" />
                <span>Create New Project</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-background-hover rounded-lg cursor-pointer transition-colors" onClick={() => { setIsSearchOpen(false); router.push("/leads"); }}>
                <Users className="w-4 h-4 text-purple-500" />
                <span>Manage Leads</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-background-hover rounded-lg cursor-pointer transition-colors" onClick={() => { setIsSearchOpen(false); toggleTheme(); }}>
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
                <span>Toggle Theme</span>
              </div>
              
              <div className="px-2 pt-4 pb-1.5 text-xs font-semibold text-foreground-muted tracking-wider">RECENT</div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-background-hover rounded-lg cursor-pointer transition-colors" onClick={() => { setIsSearchOpen(false); router.push("/dashboard"); }}>
                <Search className="w-4 h-4 text-foreground-muted" />
                <span>Dashboard Overview</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-background-hover rounded-lg cursor-pointer transition-colors" onClick={() => { setIsSearchOpen(false); router.push("/customers"); }}>
                <Search className="w-4 h-4 text-foreground-muted" />
                <span>Customers database</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
