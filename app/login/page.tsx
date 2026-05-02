"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Panel - Hero/Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-brand">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-black/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg p-2.5">
            <img src="/logo.png" alt="PT. Smart Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PT. Smart</h1>
            <p className="text-xs font-semibold text-white/80 tracking-widest uppercase">
              Internet Service Provider
            </p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg mt-12">
          <h2 className="text-5xl font-extrabold text-white leading-tight">
            Elevate Your <br />
            <span className="text-white/80">Customer Relations</span>
          </h2>
          <p className="mt-6 text-lg text-white/90 leading-relaxed font-light">
            Kelola leads, produk layanan internet, deal pipeline, dan pelanggan aktif dalam satu platform terpadu yang dirancang untuk efisiensi tim sales.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            {[
              { label: "Lead Management", desc: "Kelola prospek dengan mudah" },
              { label: "Deal Pipeline", desc: "Pantau konversi secara real-time" },
              { label: "Multi-Produk", desc: "Konfigurasi paket fleksibel" },
              { label: "Analytics", desc: "Laporan komprehensif & akurat" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                </div>
                <p className="text-xs text-white/70 pl-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-white/60 text-sm">
          <p>© 2026 PT. Smart CRM.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[560px] flex flex-col justify-center px-8 sm:px-16 relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm p-2.5">
              <img src="/logo.png" alt="PT. Smart Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">PT. Smart</h1>
              <p className="text-xs font-medium text-foreground-muted tracking-widest uppercase">CRM Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-foreground-muted text-sm">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg bg-error-bg border border-error/20 text-error text-sm font-medium animate-scale-in flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground-secondary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smart.co.id"
                required
                className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-background-card text-foreground placeholder:text-foreground-muted/50 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground-secondary">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-brand hover:text-brand-dark transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 text-sm rounded-lg border border-border bg-background-card text-foreground placeholder:text-foreground-muted/50 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-10 p-5 rounded-xl border border-border-light bg-background-hover/50">
            <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
              Demo Accounts
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted font-medium">Sales</span>
                <code className="text-xs font-mono bg-background-card px-2 py-1 rounded border border-border text-brand font-medium">
                  sales@smart.co.id / password123
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted font-medium">Manager</span>
                <code className="text-xs font-mono bg-background-card px-2 py-1 rounded border border-border text-brand font-medium">
                  manager@smart.co.id / password123
                </code>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
