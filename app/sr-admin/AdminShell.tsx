"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Users,
  LogOut,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Menu,
  X,
  Shield,
} from "lucide-react";

interface StatsData {
  locations: {
    total: number;
    active: number;
    inactive: number;
  };
  hierarchy: {
    divisions: number;
    districts: number;
    upazilas: number;
  };
  workers: {
    total: number;
    approved: number;
    pending: number;
  };
  categories: number;
}

interface AdminShellProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminShell({
  children,
  onRefresh,
  isRefreshing = false,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Auth State
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Mobile sidebar state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Global Stats for Badges
  const [stats, setStats] = useState<StatsData | null>(null);

  const checkSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch("/api/sr-admin/session");
      const data = await res.json();
      setAuthenticated(Boolean(data.authenticated));
    } catch {
      setAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/sr-admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated) {
      fetchStats();
    }
  }, [authenticated, fetchStats]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);
    try {
      const res = await fetch("/api/sr-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthenticated(true);
        fetchStats();
      } else {
        setLoginError(data.error || "Invalid username or password");
      }
    } catch {
      setLoginError("Connection error while logging in");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/sr-admin/logout", { method: "POST" });
      setAuthenticated(false);
      router.push("/sr-admin");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const navItems = [
    {
      label: "Overview",
      href: "/sr-admin",
      icon: LayoutDashboard,
      badge: null,
      isActive: pathname === "/sr-admin",
    },
    {
      label: "Locations Directory",
      href: "/sr-admin/locations",
      icon: MapPin,
      badge: stats ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
          {stats.locations.total}
        </span>
      ) : null,
      isActive: pathname.startsWith("/sr-admin/locations"),
    },
    {
      label: "Worker Verification",
      href: "/admin/workers",
      icon: Users,
      badge: stats && stats.workers.pending > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
          {stats.workers.pending}
        </span>
      ) : null,
      isActive: pathname.startsWith("/admin/workers"),
    },
  ];

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-sm font-medium">Verifying admin session...</span>
        </div>
      </div>
    );
  }

  // Login View
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-16 w-16 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Image
                src="/icon-512.png"
                alt="Sromojibi Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Sromojibi</span>
              <span className="text-emerald-500">Admin</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1.5">
              Secure administration portal for Sromojibi platform
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Sign In to Console</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Shell
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/sr-admin" className="flex items-center gap-2.5 hover:opacity-90 transition">
            <Image
              src="/icon-512.png"
              alt="Sromojibi Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Sromojibi</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Admin
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/locations"
            target="_blank"
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition flex items-center gap-1.5"
          >
            <span className="hidden sm:inline">Public Locations</span>
            <span className="sm:hidden">Public</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={() => {
              fetchStats();
              if (onRefresh) onRefresh();
            }}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700/60 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 p-4 hidden md:flex flex-col gap-1 shrink-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                  item.isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </Link>
            );
          })}

          <div className="mt-auto pt-4 border-t border-slate-800/80">
            <Link
              href="/"
              target="_blank"
              className="w-full px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-xl flex items-center justify-between transition"
            >
              <span>View Main Website</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-xs flex">
            <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Menu</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                      item.isActive
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge}
                  </Link>
                );
              })}
            </div>
            <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
          </div>
        )}

        {/* Page Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
