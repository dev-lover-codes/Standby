"use client";

import React, { useState } from "react";

export type VendorStatus = "to_call" | "quoted" | "booked" | "confirmed";

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  status: VendorStatus;
  quote: number;
  deadline: string;
}

interface VendorsTabProps {
  initialVendors: VendorItem[];
}

const STATUS_CONFIG: Record<VendorStatus, { label: string; bg: string; text: string }> = {
  to_call: { label: "To Call", bg: "bg-[var(--line)]", text: "text-[var(--ink)]" },
  quoted: { label: "Quoted", bg: "bg-[var(--tape-yellow)]", text: "text-[#1B1A17]" },
  booked: { label: "Booked", bg: "bg-[var(--safe-green)]", text: "text-white" },
  confirmed: { label: "Confirmed", bg: "bg-[var(--ink)]", text: "text-[var(--bg)]" },
};

export function VendorsTab({ initialVendors }: VendorsTabProps) {
  const [vendors, setVendors] = useState<VendorItem[]>(initialVendors);

  const handleStatusChange = (id: string, newStatus: VendorStatus) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
  };

  const bookedCount = vendors.filter(
    (v) => v.status === "booked" || v.status === "confirmed"
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-bold text-base">Vendor Checklist</h3>
        <span className="font-mono text-xs px-2.5 py-1 bg-[var(--card-bg)] border border-[var(--line)] rounded">
          Status: <strong>{bookedCount}</strong> of {vendors.length} secured
        </span>
      </div>

      <div className="cue-card divide-y divide-[var(--line)]">
        <div className="p-3 bg-[var(--bg)] grid grid-cols-12 text-xs font-mono font-bold text-[var(--muted)] uppercase">
          <div className="col-span-4 sm:col-span-3">Category & Contact</div>
          <div className="col-span-3 sm:col-span-3">Deadline</div>
          <div className="col-span-2 sm:col-span-3 text-right">Quote</div>
          <div className="col-span-3 sm:col-span-3 text-right">Status</div>
        </div>

        {vendors.map((vendor) => {
          const cfg = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.to_call;
          return (
            <div key={vendor.id} className="p-3 grid grid-cols-12 items-center gap-2">
              <div className="col-span-4 sm:col-span-3">
                <span className="font-mono text-[10px] text-[var(--muted)] uppercase block">
                  {vendor.category}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-[var(--ink)]">
                  {vendor.name}
                </span>
              </div>

              <div className="col-span-3 sm:col-span-3 font-mono text-xs text-[var(--ink)]">
                {vendor.deadline || "TBD"}
              </div>

              <div className="col-span-2 sm:col-span-3 text-right font-mono font-bold text-xs sm:text-sm">
                ${vendor.quote?.toLocaleString() ?? 0}
              </div>

              <div className="col-span-3 sm:col-span-3 flex justify-end">
                <label htmlFor={`status-${vendor.id}`} className="sr-only">
                  Update status for {vendor.name}
                </label>
                <select
                  id={`status-${vendor.id}`}
                  value={vendor.status}
                  onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                  className={`font-mono text-xs font-bold px-2 py-1 rounded border border-[var(--ink)] cursor-pointer min-h-[44px] ${cfg.bg} ${cfg.text}`}
                >
                  <option value="to_call">To Call</option>
                  <option value="quoted">Quoted</option>
                  <option value="booked">Booked</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
