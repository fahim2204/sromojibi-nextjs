"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminShell from "./AdminShell";
import {
  MapPin,
  Users,
  FolderTree,
  Plus,
  ArrowRight,
  Globe,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
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

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sr-admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <AdminShell onRefresh={fetchStats} isRefreshing={loading}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
            <p className="text-slate-400 text-xs mt-1">
              Live operational metrics and management shortcuts across Sromojibi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/sr-admin/locations?action=new"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Service Locations */}
          <Link
            href="/sr-admin/locations"
            className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden transition group"
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Service Locations</div>
              <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">
              {loading ? "..." : stats?.locations.total ?? "0"}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{stats?.locations.active ?? 0} Active</span>
              <span>•</span>
              <span className="text-slate-500">{stats?.locations.inactive ?? 0} Inactive</span>
            </div>
          </Link>

          {/* Card 2: Administrative Hierarchy */}
          <Link
            href="/sr-admin/locations?tab=hierarchy"
            className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden transition group"
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Geographic Coverage</div>
              <Building2 className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">
              {loading ? "..." : stats?.hierarchy.districts ?? "64"}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
              <span>{stats?.hierarchy.divisions ?? 8} Divisions</span>
              <span>•</span>
              <span>{stats?.hierarchy.upazilas ?? 0} Upazilas</span>
            </div>
          </Link>

          {/* Card 3: Worker Profiles */}
          <Link
            href="/admin/workers"
            className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden transition group"
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Worker Profiles</div>
              <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">
              {loading ? "..." : stats?.workers.total ?? "0"}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{stats?.workers.approved ?? 0} Approved</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{stats?.workers.pending ?? 0} Pending</span>
            </div>
          </Link>

          {/* Card 4: Categories */}
          <Link
            href="/categories"
            target="_blank"
            className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden transition group"
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Services</div>
              <FolderTree className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
            </div>
            <div className="text-3xl font-extrabold text-purple-400 mt-2">
              {loading ? "..." : stats?.categories ?? "0"}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400">
              <span>Trade skill categories</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </div>
          </Link>
        </div>

        {/* Quick Navigation Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Management Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Module Card */}
            <Link
              href="/sr-admin/locations"
              className="p-5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Location Module</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Add, update, or toggle service locations and configure Bangladesh administrative divisions, districts, and upazilas.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-4 group-hover:translate-x-1 transition">
                <span>Manage Locations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Worker Verification Card */}
            <Link
              href="/admin/workers"
              className="p-5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Worker Verification</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Review registrations, approve or reject worker applications, and view phone/location verification status.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold mt-4 group-hover:translate-x-1 transition">
                <span>Review Registrations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Public Explorer Card */}
            <Link
              href="/locations"
              target="_blank"
              className="p-5 bg-gradient-to-br from-emerald-950/30 via-slate-900/40 to-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-lg shadow-emerald-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Public Location Directory</h3>
                <p className="text-slate-300 text-xs mt-1">
                  Explore how Bangladesh address hierarchy appears to users across divisions, zillas, upazilas, and unions.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-4 group-hover:translate-x-1 transition">
                <span>Open Public Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
