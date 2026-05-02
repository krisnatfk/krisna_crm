"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getInitials } from "@/lib/utils";
import { Loader2, User, Lock, Mail, Save, Camera } from "lucide-react";
import { useRef } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  // Pre-fill form when user is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
      setAvatarBase64(user.avatar_url || null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      addToast("error", "Gagal", "Ukuran file maksimal 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setAvatarBase64(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast("error", "Gagal", "Nama dan email tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name,
          email: formData.email,
          avatar_url: avatarBase64
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil");
      
      const isEmailChanged = formData.email !== user?.email;
      if (isEmailChanged) {
        addToast("success", "Berhasil", "Profil berhasil diperbarui. Silakan login kembali dengan email baru.");
        setTimeout(() => { window.location.href = "/login" }, 2000);
      } else {
        addToast("success", "Berhasil", "Profil berhasil diperbarui. Halaman akan dimuat ulang.");
        setTimeout(() => { window.location.reload() }, 1000);
      }
    } catch (err: any) {
      addToast("error", "Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      addToast("error", "Gagal", "Semua kolom password harus diisi");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      addToast("error", "Gagal", "Password baru dan konfirmasi tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui password");
      
      addToast("success", "Berhasil", "Password berhasil diperbarui");
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err: any) {
      addToast("error", "Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 w-full max-w-6xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Profil</h1>
        <p className="text-sm text-foreground-muted">Kelola informasi pribadi dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-brand" /> Profil Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full bg-brand flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0 overflow-hidden border-2 border-transparent group-hover:border-brand/50 transition-all">
                    {avatarBase64 ? (
                      <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-foreground-muted flex items-center gap-1.5 mt-1">
                    <Mail className="w-4 h-4" /> {user.email}
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold tracking-wide rounded-md capitalize bg-background-muted text-foreground-secondary border border-border">
                    Role: {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Nama Lengkap</label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Masukkan nama lengkap" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange}
                  />
                  <p className="text-[11px] text-foreground-muted">Jika Anda mengganti email, Anda harus login ulang menggunakan email baru.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Profil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand" /> Keamanan & Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">Password Saat Ini</label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={formData.currentPassword} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-foreground">Password Baru</label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={formData.newPassword} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Konfirmasi Password Baru</label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary" disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
