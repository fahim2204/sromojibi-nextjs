"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "../AdminShell";
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  Building2,
  X,
  ChevronDown,
  AlertCircle,
  FolderTree,
  Flag,
} from "lucide-react";

interface DivisionOption {
  id: string;
  title?: string;
  title_en: string | null;
  title_bn: string | null;
  bbs_code?: number | null;
}

interface DistrictItem {
  id: string;
  title: string;
  title_en: string | null;
  title_bn: string | null;
  loc_division_id: string;
  url: string | null;
  bbs_code: number | null;
  row_status: number;
  division?: {
    id: string;
    title_en: string | null;
    title_bn: string | null;
  };
  _count?: {
    upazilas: number;
    workers: number;
  };
}

interface UpazilaItem {
  id: string;
  title_en: string | null;
  title_bn: string | null;
  loc_district_id: string;
  loc_division_id: string;
  url: string | null;
  bbs_code: string | null;
  row_status: number;
  district?: {
    id: string;
    title_en: string | null;
    title_bn: string | null;
  };
  _count?: {
    unions: number;
    workers: number;
  };
}

interface UnionItem {
  id: string;
  title_en: string | null;
  title_bn: string | null;
  loc_district_id: string;
  loc_division_id: string;
  loc_upazila_id: string;
  bbs_code: string | null;
  row_status: number;
  upazila?: {
    id: string;
    title_en: string | null;
    title_bn: string | null;
    district?: {
      id: string;
      title_en: string | null;
      title_bn: string | null;
    };
  };
  _count?: {
    workers: number;
  };
}

interface CityAreaItem {
  id: string;
  title_en: string;
  title_bn: string;
  parent_thana: string | null;
  postal_code: string | null;
  bbs_code: string | null;
  loc_district_id: string;
  loc_division_id: string;
  loc_upazila_id: string | null;
  row_status: number;
  district?: {
    id: string;
    title_en: string | null;
    title_bn: string | null;
  };
  upazila?: {
    id: string;
    title_en: string | null;
    title_bn: string | null;
  };
  _count?: {
    workers: number;
  };
}

const STATIC_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

function AdminLocationsContent() {
  const searchParams = useSearchParams();

  // Active Tab: 'districts' | 'upazilas' | 'city_areas' | 'unions'
  const [activeTab, setActiveTab] = useState<"districts" | "upazilas" | "city_areas" | "unions">("districts");

  // Data lists
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [upazilas, setUpazilas] = useState<UpazilaItem[]>([]);
  const [unions, setUnions] = useState<UnionItem[]>([]);
  const [cityAreas, setCityAreas] = useState<CityAreaItem[]>([]);
  const [divisionsList, setDivisionsList] = useState<DivisionOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");

  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<Partial<DistrictItem> | null>(null);

  const [showUpazilaModal, setShowUpazilaModal] = useState(false);
  const [editingUpazila, setEditingUpazila] = useState<Partial<UpazilaItem> | null>(null);

  const [showUnionModal, setShowUnionModal] = useState(false);
  const [editingUnion, setEditingUnion] = useState<Partial<UnionItem> | null>(null);

  const [showCityAreaModal, setShowCityAreaModal] = useState(false);
  const [editingCityArea, setEditingCityArea] = useState<Partial<CityAreaItem> | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Fetch Divisions for dropdown selects
  const fetchDivisions = useCallback(async () => {
    try {
      const res = await fetch("/api/sr-admin/locations?type=divisions");
      if (res.ok) {
        const data = await res.json();
        setDivisionsList(data.divisions || []);
      }
    } catch (e) {
      console.error("Failed to load divisions:", e);
    }
  }, []);

  // Fetch Districts
  const fetchDistricts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "districts");
      if (searchQuery) params.set("q", searchQuery);
      if (selectedDivision !== "all") params.set("division", selectedDivision);

      const res = await fetch(`/api/sr-admin/locations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDistricts(data.districts || []);
      }
    } catch (e) {
      console.error("Failed to fetch districts:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDivision]);

  // Fetch Upazilas
  const fetchUpazilas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "upazilas");
      if (searchQuery) params.set("q", searchQuery);
      if (selectedDistrictFilter !== "all") params.set("district_id", selectedDistrictFilter);

      const res = await fetch(`/api/sr-admin/locations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUpazilas(data.upazilas || []);
      }
    } catch (e) {
      console.error("Failed to fetch upazilas:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDistrictFilter]);

  // Fetch Unions
  const fetchUnions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "unions");
      if (searchQuery) params.set("q", searchQuery);
      if (selectedDistrictFilter !== "all") params.set("district_id", selectedDistrictFilter);

      const res = await fetch(`/api/sr-admin/locations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUnions(data.unions || []);
      }
    } catch (e) {
      console.error("Failed to fetch unions:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDistrictFilter]);

  // Fetch City Areas
  const fetchCityAreas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "city_areas");
      if (searchQuery) params.set("q", searchQuery);
      if (selectedDistrictFilter !== "all") params.set("district_id", selectedDistrictFilter);

      const res = await fetch(`/api/sr-admin/locations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCityAreas(data.city_areas || []);
      }
    } catch (e) {
      console.error("Failed to fetch city areas:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDistrictFilter]);

  // Initial load
  useEffect(() => {
    fetchDivisions();
    fetch("/api/sr-admin/locations?type=districts")
      .then((r) => r.json())
      .then((d) => {
        if (d.districts) setDistricts(d.districts);
      })
      .catch(() => {});
  }, [fetchDivisions]);

  // Switch tab loader
  useEffect(() => {
    if (activeTab === "districts") {
      fetchDistricts();
    } else if (activeTab === "upazilas") {
      fetchUpazilas();
    } else if (activeTab === "unions") {
      fetchUnions();
    } else if (activeTab === "city_areas") {
      fetchCityAreas();
    }
  }, [activeTab, fetchDistricts, fetchUpazilas, fetchUnions, fetchCityAreas]);

  // Handle URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "districts" || tabParam === "upazilas" || tabParam === "unions" || tabParam === "city_areas") {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // 2. SAVE DISTRICT
  const handleSaveDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;
    setIsSaving(true);
    setModalError("");

    try {
      const isEdit = Boolean(editingDistrict.id && districts.some((d) => d.id === editingDistrict.id));
      const res = await fetch("/api/sr-admin/locations", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingDistrict,
          type: "district",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowDistrictModal(false);
        setEditingDistrict(null);
        fetchDistricts();
      } else {
        setModalError(data.error || "Failed to save district");
      }
    } catch {
      setModalError("Error connecting to server");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. SAVE UPAZILA
  const handleSaveUpazila = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUpazila) return;
    setIsSaving(true);
    setModalError("");

    try {
      const isEdit = Boolean(editingUpazila.id && upazilas.some((u) => u.id === editingUpazila.id));
      const res = await fetch("/api/sr-admin/locations", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingUpazila,
          type: "upazila",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowUpazilaModal(false);
        setEditingUpazila(null);
        fetchUpazilas();
      } else {
        setModalError(data.error || "Failed to save upazila");
      }
    } catch {
      setModalError("Error connecting to server");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. SAVE UNION
  const handleSaveUnion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnion) return;
    setIsSaving(true);
    setModalError("");

    try {
      const isEdit = Boolean(editingUnion.id && unions.some((u) => u.id === editingUnion.id));
      const res = await fetch("/api/sr-admin/locations", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingUnion,
          type: "union",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowUnionModal(false);
        setEditingUnion(null);
        fetchUnions();
      } else {
        setModalError(data.error || "Failed to save union");
      }
    } catch {
      setModalError("Error connecting to server");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. SAVE CITY AREA
  const handleSaveCityArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCityArea) return;
    setIsSaving(true);
    setModalError("");

    try {
      const isEdit = Boolean(editingCityArea.id && cityAreas.some((c) => c.id === editingCityArea.id));
      const res = await fetch("/api/sr-admin/locations", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingCityArea,
          type: "city_area",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCityAreaModal(false);
        setEditingCityArea(null);
        fetchCityAreas();
      } else {
        setModalError(data.error || "Failed to save city area");
      }
    } catch {
      setModalError("Error connecting to server");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entity handler
  const handleDeleteEntity = async (type: "district" | "upazila" | "union" | "city_area", id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;

    try {
      const res = await fetch(`/api/sr-admin/locations?type=${type}&id=${id}&hard=false`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        if (type === "district") fetchDistricts();
        if (type === "upazila") fetchUpazilas();
        if (type === "union") fetchUnions();
        if (type === "city_area") fetchCityAreas();
      } else {
        alert(data.error || "Failed to delete item");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting item");
    }
  };

  return (
    <AdminShell
      onRefresh={() => {
        if (activeTab === "districts") fetchDistricts();
        if (activeTab === "upazilas") fetchUpazilas();
        if (activeTab === "unions") fetchUnions();
        if (activeTab === "city_areas") fetchCityAreas();
      }}
      isRefreshing={loading}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">Location Module</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activeTab === "districts" && `${districts.length} Districts`}
                {activeTab === "upazilas" && `${upazilas.length} Upazilas`}
                {activeTab === "unions" && `${unions.length} Unions`}
                {activeTab === "city_areas" && `${cityAreas.length} City Areas`}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Add and manage districts (zillas), upazilas, city corporation areas, and unions across Bangladesh.
            </p>
          </div>

          {/* Action Add Buttons based on active tab */}
          <div className="flex items-center gap-2.5">

            {activeTab === "districts" && (
              <button
                onClick={() => {
                  setEditingDistrict({
                    title_en: "",
                    title_bn: "",
                    loc_division_id: divisionsList[0]?.id || "66648869fbd77af96fdf18a3",
                    url: "",
                    bbs_code: undefined,
                  });
                  setModalError("");
                  setShowDistrictModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add District (Zilla)</span>
              </button>
            )}

            {activeTab === "upazilas" && (
              <button
                onClick={() => {
                  setEditingUpazila({
                    title_en: "",
                    title_bn: "",
                    loc_district_id: districts[0]?.id || "",
                    url: "",
                    bbs_code: "",
                  });
                  setModalError("");
                  setShowUpazilaModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Upazila</span>
              </button>
            )}

            {activeTab === "unions" && (
              <button
                onClick={() => {
                  setEditingUnion({
                    title_en: "",
                    title_bn: "",
                    loc_district_id: districts[0]?.id || "",
                    loc_upazila_id: upazilas[0]?.id || "",
                    bbs_code: "",
                  });
                  setModalError("");
                  setShowUnionModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Union</span>
              </button>
            )}

            {activeTab === "city_areas" && (
              <button
                onClick={() => {
                  setEditingCityArea({
                    title_en: "",
                    title_bn: "",
                    parent_thana: "",
                    loc_district_id: districts[0]?.id || "",
                    loc_division_id: districts[0]?.loc_division_id || divisionsList[0]?.id || "",
                    postal_code: "",
                    bbs_code: "",
                  });
                  setModalError("");
                  setShowCityAreaModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add City Area</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Main Module Tabs */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("districts")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === "districts"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Districts (64 Zilla)</span>
          </button>

          <button
            onClick={() => setActiveTab("upazilas")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === "upazilas"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Upazilas (Sub-districts)</span>
          </button>

          <button
            onClick={() => setActiveTab("city_areas")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === "city_areas"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>City Areas (সিটি এলাকা / থানা)</span>
          </button>

          <button
            onClick={() => setActiveTab("unions")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === "unions"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Unions</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by English, Bengali name or code..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-slate-100 text-xs outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Division Filter for District */}
            {activeTab === "districts" && (
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full md:w-44 bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none transition appearance-none cursor-pointer"
                >
                  <option value="all">All Divisions</option>
                  {divisionsList.length > 0
                    ? divisionsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title_en || d.title} ({d.title_bn})
                        </option>
                      ))
                    : STATIC_DIVISIONS.map((div) => (
                        <option key={div} value={div}>
                          {div} Division
                        </option>
                      ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* District Filter for Upazilas, Unions & City Areas */}
            {(activeTab === "upazilas" || activeTab === "unions" || activeTab === "city_areas") && (
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="w-full md:w-52 bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none transition appearance-none cursor-pointer"
                >
                  <option value="all">All Districts (64 Zilla)</option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.title_en || dist.title} {dist.title_bn ? `(${dist.title_bn})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* 1. DISTRICTS TABLE */}
        {activeTab === "districts" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">District Title</th>
                    <th className="p-4">Bengali Title</th>
                    <th className="p-4">Division</th>
                    <th className="p-4">Official Portal</th>
                    <th className="p-4">Upazilas</th>
                    <th className="p-4">BBS Code</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-500" />
                        <span>Loading districts...</span>
                      </td>
                    </tr>
                  ) : districts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No districts found.
                      </td>
                    </tr>
                  ) : (
                    districts.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>{d.title_en || d.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">
                          {d.title_bn || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="p-4 text-slate-300">
                          {d.division?.title_en || d.loc_division_id}
                        </td>
                        <td className="p-4">
                          {d.url ? (
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 font-mono text-[11px] truncate max-w-xs"
                            >
                              <span>{d.url.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-200">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                            {d._count?.upazilas ?? 0} Upazilas
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {d.bbs_code || "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingDistrict({ ...d });
                                setModalError("");
                                setShowDistrictModal(true);
                              }}
                              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                              title="Edit District"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntity("district", d.id, d.title_en || d.title)}
                              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                              title="Delete District"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. UPAZILAS TABLE */}
        {activeTab === "upazilas" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Upazila Title</th>
                    <th className="p-4">Bengali Title</th>
                    <th className="p-4">Parent District</th>
                    <th className="p-4">Official Web Portal</th>
                    <th className="p-4">Unions</th>
                    <th className="p-4">BBS Code</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Loading upazilas...</span>
                      </td>
                    </tr>
                  ) : upazilas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No upazilas found.
                      </td>
                    </tr>
                  ) : (
                    upazilas.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <FolderTree className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{u.title_en}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">
                          {u.title_bn || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="p-4 text-slate-300">
                          {u.district?.title_en || u.loc_district_id}
                        </td>
                        <td className="p-4">
                          {u.url ? (
                            <a
                              href={u.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-mono text-[11px] truncate max-w-xs"
                            >
                              <span>{u.url.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-200">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                            {u._count?.unions ?? 0} Unions
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {u.bbs_code || "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUpazila({ ...u });
                                setModalError("");
                                setShowUpazilaModal(true);
                              }}
                              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                              title="Edit Upazila"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntity("upazila", u.id, u.title_en || "Upazila")}
                              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                              title="Delete Upazila"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. UNIONS TABLE */}
        {activeTab === "unions" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Union Title</th>
                    <th className="p-4">Bengali Title</th>
                    <th className="p-4">Upazila</th>
                    <th className="p-4">District</th>
                    <th className="p-4">BBS Code</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                        <span>Loading unions...</span>
                      </td>
                    </tr>
                  ) : unions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No unions found. Try selecting a district above or searching.
                      </td>
                    </tr>
                  ) : (
                    unions.map((un) => (
                      <tr key={un.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Flag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{un.title_en}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">
                          {un.title_bn || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="p-4 text-slate-300">
                          {un.upazila?.title_en || un.loc_upazila_id}
                        </td>
                        <td className="p-4 text-slate-400">
                          {un.upazila?.district?.title_en || un.loc_district_id}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {un.bbs_code || "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUnion({ ...un });
                                setModalError("");
                                setShowUnionModal(true);
                              }}
                              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                              title="Edit Union"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntity("union", un.id, un.title_en || "Union")}
                              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                              title="Delete Union"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CITY AREAS TABLE */}
        {activeTab === "city_areas" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">City Area Title</th>
                    <th className="p-4">Bengali Title</th>
                    <th className="p-4">Parent Thana / Zone</th>
                    <th className="p-4">District</th>
                    <th className="p-4">Postal Code</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                        <span>Loading city areas...</span>
                      </td>
                    </tr>
                  ) : cityAreas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No city areas found yet. Click &quot;Add City Area&quot; above to populate areas for Dhaka, Chittagong, etc.
                      </td>
                    </tr>
                  ) : (
                    cityAreas.map((ca) => (
                      <tr key={ca.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{ca.title_en}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">
                          {ca.title_bn || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="p-4 text-slate-300">
                          {ca.parent_thana || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="p-4 text-slate-400">
                          {ca.district?.title_en || ca.loc_district_id}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {ca.postal_code || "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCityArea({ ...ca });
                                setModalError("");
                                setShowCityAreaModal(true);
                              }}
                              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                              title="Edit City Area"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntity("city_area", ca.id, ca.title_en || "City Area")}
                              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                              title="Delete City Area"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD / EDIT DISTRICT */}
        {showDistrictModal && editingDistrict && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">
                    {editingDistrict.id && districts.some((d) => d.id === editingDistrict.id)
                      ? "Edit District Entity"
                      : "Add New District (Zilla)"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDistrictModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveDistrict} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      District Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingDistrict.title_en || editingDistrict.title || ""}
                      onChange={(e) =>
                        setEditingDistrict({ ...editingDistrict, title_en: e.target.value })
                      }
                      placeholder="e.g. Gazipur"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Title in Bengali (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={editingDistrict.title_bn || ""}
                      onChange={(e) =>
                        setEditingDistrict({ ...editingDistrict, title_bn: e.target.value })
                      }
                      placeholder="e.g. গাজীপুর"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Parent Division *
                    </label>
                    <select
                      value={editingDistrict.loc_division_id || ""}
                      onChange={(e) =>
                        setEditingDistrict({ ...editingDistrict, loc_division_id: e.target.value })
                      }
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                    >
                      {divisionsList.map((div) => (
                        <option key={div.id} value={div.id}>
                          {div.title_en || div.title} {div.title_bn ? `(${div.title_bn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      BBS Code
                    </label>
                    <input
                      type="number"
                      value={editingDistrict.bbs_code ?? ""}
                      onChange={(e) =>
                        setEditingDistrict({
                          ...editingDistrict,
                          bbs_code: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      placeholder="e.g. 33"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                    Official Government Web Portal
                  </label>
                  <input
                    type="url"
                    value={editingDistrict.url || ""}
                    onChange={(e) =>
                      setEditingDistrict({ ...editingDistrict, url: e.target.value })
                    }
                    placeholder="https://gazipur.gov.bd"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowDistrictModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>
                        {editingDistrict.id && districts.some((d) => d.id === editingDistrict.id)
                          ? "Update District"
                          : "Create District"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD / EDIT UPAZILA */}
        {showUpazilaModal && editingUpazila && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">
                    {editingUpazila.id && upazilas.some((u) => u.id === editingUpazila.id)
                      ? "Edit Upazila"
                      : "Add New Upazila"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowUpazilaModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveUpazila} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Upazila Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingUpazila.title_en || ""}
                      onChange={(e) =>
                        setEditingUpazila({ ...editingUpazila, title_en: e.target.value })
                      }
                      placeholder="e.g. Sreepur"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Title in Bengali (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={editingUpazila.title_bn || ""}
                      onChange={(e) =>
                        setEditingUpazila({ ...editingUpazila, title_bn: e.target.value })
                      }
                      placeholder="e.g. শ্রীপুর"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Parent District (Zilla) *
                    </label>
                    <select
                      value={editingUpazila.loc_district_id || ""}
                      onChange={(e) =>
                        setEditingUpazila({ ...editingUpazila, loc_district_id: e.target.value })
                      }
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                    >
                      {districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.title_en || dist.title} {dist.title_bn ? `(${dist.title_bn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      BBS Code
                    </label>
                    <input
                      type="text"
                      value={editingUpazila.bbs_code || ""}
                      onChange={(e) =>
                        setEditingUpazila({ ...editingUpazila, bbs_code: e.target.value })
                      }
                      placeholder="e.g. 86"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                    Official Upazila Web Portal
                  </label>
                  <input
                    type="url"
                    value={editingUpazila.url || ""}
                    onChange={(e) =>
                      setEditingUpazila({ ...editingUpazila, url: e.target.value })
                    }
                    placeholder="https://sreepur.gazipur.gov.bd"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUpazilaModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>
                        {editingUpazila.id && upazilas.some((u) => u.id === editingUpazila.id)
                          ? "Update Upazila"
                          : "Create Upazila"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: ADD / EDIT UNION */}
        {showUnionModal && editingUnion && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Flag className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">
                    {editingUnion.id && unions.some((u) => u.id === editingUnion.id)
                      ? "Edit Union"
                      : "Add New Union"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowUnionModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveUnion} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Union Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingUnion.title_en || ""}
                      onChange={(e) =>
                        setEditingUnion({ ...editingUnion, title_en: e.target.value })
                      }
                      placeholder="e.g. Mawna"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Title in Bengali (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={editingUnion.title_bn || ""}
                      onChange={(e) =>
                        setEditingUnion({ ...editingUnion, title_bn: e.target.value })
                      }
                      placeholder="e.g. মাওনা"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Parent District (Zilla)
                    </label>
                    <select
                      value={editingUnion.loc_district_id || ""}
                      onChange={(e) => {
                        const distId = e.target.value;
                        setEditingUnion({ ...editingUnion, loc_district_id: distId });
                        // fetch upazilas for this district
                        fetch(`/api/sr-admin/locations?type=upazilas&district_id=${distId}`)
                          .then((r) => r.json())
                          .then((d) => {
                            if (d.upazilas && d.upazilas.length > 0) {
                              setUpazilas(d.upazilas);
                              setEditingUnion((prev) =>
                                prev ? { ...prev, loc_district_id: distId, loc_upazila_id: d.upazilas[0].id } : null
                              );
                            }
                          })
                          .catch(() => {});
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                    >
                      {districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.title_en || dist.title} {dist.title_bn ? `(${dist.title_bn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Parent Upazila *
                    </label>
                    <select
                      value={editingUnion.loc_upazila_id || ""}
                      onChange={(e) =>
                        setEditingUnion({ ...editingUnion, loc_upazila_id: e.target.value })
                      }
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                    >
                      {upazilas.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.title_en} {u.title_bn ? `(${u.title_bn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                    BBS Code
                  </label>
                  <input
                    type="text"
                    value={editingUnion.bbs_code || ""}
                    onChange={(e) =>
                      setEditingUnion({ ...editingUnion, bbs_code: e.target.value })
                    }
                    placeholder="e.g. 12"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUnionModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-600/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>
                        {editingUnion.id && unions.some((u) => u.id === editingUnion.id)
                          ? "Update Union"
                          : "Create Union"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: ADD / EDIT CITY AREA */}
        {showCityAreaModal && editingCityArea && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">
                    {editingCityArea.id && cityAreas.some((c) => c.id === editingCityArea.id)
                      ? "Edit City Area"
                      : "Add City Area"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCityAreaModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCityArea} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    City Area Title (English) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCityArea.title_en || ""}
                    onChange={(e) =>
                      setEditingCityArea({ ...editingCityArea, title_en: e.target.value })
                    }
                    placeholder="e.g. Mirpur 10, Sector 3, Town Hall"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    City Area Title (Bengali) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCityArea.title_bn || ""}
                    onChange={(e) =>
                      setEditingCityArea({ ...editingCityArea, title_bn: e.target.value })
                    }
                    placeholder="যেমন: মিরপুর ১০, সেক্টর ৩, টাউন হল"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Parent Metro Thana / Zone (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={editingCityArea.parent_thana || ""}
                    onChange={(e) =>
                      setEditingCityArea({ ...editingCityArea, parent_thana: e.target.value })
                    }
                    placeholder="যেমন: Mirpur, Uttara, Mohammadpur, Gulshan"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Parent District (Zilla) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editingCityArea.loc_district_id || ""}
                    onChange={(e) => {
                      const dist = districts.find((d) => d.id === e.target.value);
                      setEditingCityArea({
                        ...editingCityArea,
                        loc_district_id: e.target.value,
                        loc_division_id: dist?.loc_division_id || editingCityArea.loc_division_id,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none appearance-none"
                  >
                    {districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.title_en || dist.title} ({dist.title_bn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Postal Code (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={editingCityArea.postal_code || ""}
                      onChange={(e) =>
                        setEditingCityArea({ ...editingCityArea, postal_code: e.target.value })
                      }
                      placeholder="e.g. 1216"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">BBS Code (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={editingCityArea.bbs_code || ""}
                      onChange={(e) =>
                        setEditingCityArea({ ...editingCityArea, bbs_code: e.target.value })
                      }
                      placeholder="e.g. 26"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCityAreaModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-600/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>
                        {editingCityArea.id && cityAreas.some((c) => c.id === editingCityArea.id)
                          ? "Update City Area"
                          : "Create City Area"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default function AdminLocationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
        </div>
      }
    >
      <AdminLocationsContent />
    </Suspense>
  );
}
