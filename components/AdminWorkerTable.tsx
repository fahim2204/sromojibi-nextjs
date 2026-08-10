"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { APP_API } from "@/constants/api";

type WorkerItem = {
  id: number;
  full_name: string;
  phone: string;
  slug: string;
  service_type: string;
  city: string;
  experience: string;
  details?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  is_verified: boolean;
  created_at: string | Date;
  category?: { name: string; icon?: string | null } | null;
};

type Props = {
  initialWorkers: WorkerItem[];
};

export default function AdminWorkerTable({ initialWorkers }: Props) {
  const [workers, setWorkers] = useState<WorkerItem[]>(initialWorkers);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);

  const pendingCount = workers.filter((w) => w.status === "PENDING").length;
  const approvedCount = workers.filter((w) => w.status === "APPROVED").length;
  const rejectedCount = workers.filter((w) => w.status === "REJECTED").length;

  const filteredWorkers = workers.filter((w) => {
    if (activeTab === "ALL") return true;
    return w.status === activeTab;
  });

  const handleUpdateStatus = async (
    slug: string,
    newStatus: "PENDING" | "APPROVED" | "REJECTED",
    isVerified = newStatus === "APPROVED"
  ) => {
    setUpdatingSlug(slug);
    try {
      const res = await fetch(APP_API.ADMIN.UPDATE_WORKER(slug), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          is_verified: isVerified,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message ?? "Status update failed");
      }

      setWorkers((prev) =>
        prev.map((w) =>
          w.slug === slug
            ? { ...w, status: newStatus, is_verified: isVerified }
            : w
        )
      );
    } catch (err: any) {
      alert(err.message ?? "Error updating status");
    } finally {
      setUpdatingSlug(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Profiles</p>
          <p className="text-3xl font-black text-gray-900">{workers.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-1">
          <p className="text-xs text-amber-800 font-semibold uppercase">Pending Review</p>
          <p className="text-3xl font-black text-amber-700">{pendingCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-1">
          <p className="text-xs text-emerald-800 font-semibold uppercase">Approved Profiles</p>
          <p className="text-3xl font-black text-emerald-700">{approvedCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm space-y-1">
          <p className="text-xs text-rose-800 font-semibold uppercase">Rejected Requests</p>
          <p className="text-3xl font-black text-rose-700">{rejectedCount}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab === "PENDING" && `⏳ Pending (${pendingCount})`}
            {tab === "APPROVED" && `✓ Approved (${approvedCount})`}
            {tab === "REJECTED" && `✕ Rejected (${rejectedCount})`}
            {tab === "ALL" && `All Registrations (${workers.length})`}
          </button>
        ))}
      </div>

      {/* Workers List Table / Cards */}
      <div className="space-y-4">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="p-6 rounded-2xl bg-white border border-gray-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-gray-300 shadow-sm transition-all"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">{worker.full_name}</h3>
                  <a
                    href={`tel:${worker.phone}`}
                    className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 hover:underline"
                  >
                    📞 {worker.phone}
                  </a>

                  {/* Status Badge */}
                  {worker.status === "PENDING" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                      ⏳ Pending Approval
                    </span>
                  )}
                  {worker.status === "APPROVED" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      ✓ Approved & Live
                    </span>
                  )}
                  {worker.status === "REJECTED" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                      ✕ Rejected
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 font-medium">
                  {worker.category?.icon ?? "🛠️"} {worker.service_type} • Location: <strong className="text-gray-900">{worker.city}</strong> • Experience: <strong className="text-gray-900">{worker.experience}</strong>
                </p>

                {worker.details && (
                  <p className="text-xs text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-200">
                    "{worker.details}"
                  </p>
                )}

                <p className="text-[11px] text-gray-400">
                  Registered on {new Date(worker.created_at).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                {worker.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    isLoading={updatingSlug === worker.slug}
                    onClick={() => handleUpdateStatus(worker.slug, "APPROVED", true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    ✓ Approve Worker
                  </Button>
                )}

                {worker.status !== "REJECTED" && (
                  <Button
                    size="sm"
                    variant="bordered"
                    isLoading={updatingSlug === worker.slug}
                    onClick={() => handleUpdateStatus(worker.slug, "REJECTED", false)}
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl"
                  >
                    ✕ Reject
                  </Button>
                )}

                {worker.status !== "PENDING" && (
                  <Button
                    size="sm"
                    variant="bordered"
                    isLoading={updatingSlug === worker.slug}
                    onClick={() => handleUpdateStatus(worker.slug, "PENDING", false)}
                    className="border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-xs rounded-xl"
                  >
                    ⏳ Reset Pending
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-3 shadow-sm">
            <div className="text-3xl">📋</div>
            <h4 className="text-base font-bold text-gray-900">No Profiles in "{activeTab}" Status</h4>
            <p className="text-xs text-gray-500">Select another filter tab above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
