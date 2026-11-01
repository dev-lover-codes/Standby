"use client";

import { useState } from "react";
import { updateVendorAction } from "@/app/feature-actions";
import type { VendorStatus } from "@/lib/validation/schemas";

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  status: VendorStatus;
  quote: number | null;
  deadline: string;
}

interface VendorsTabProps {
  initialVendors: VendorItem[];
  /** When true, changes are saved. Share pages pass false (read-only). */
  editable?: boolean;
}

const STATUS_LABEL: Record<VendorStatus, string> = { to_call: "To call", quoted: "Quoted", booked: "Booked", confirmed: "Confirmed" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELD = "min-h-[44px] w-full px-2 rounded-[10px] bg-white/5 border border-[var(--line)] text-sm text-white";

export function VendorsTab({ initialVendors, editable = false }: VendorsTabProps) {
  const [vendors, setVendors] = useState(initialVendors);
  const [status, setStatus] = useState("");

  const save = async (v: VendorItem, patch: Partial<Pick<VendorItem, "status" | "quote">> & { deadline?: string | null }) => {
    setVendors((prev) => prev.map((x) => (x.id === v.id ? { ...x, ...patch, deadline: "deadline" in patch ? patch.deadline ?? "" : x.deadline } : x)));
    if (!editable || !UUID.test(v.id)) return;
    const res = await updateVendorAction(v.id, patch);
    setStatus(res.success ? `${v.category} saved.` : res.error ?? "Could not save. Try again.");
  };

  const secured = vendors.filter((v) => v.status === "booked" || v.status === "confirmed").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Vendor checklist</h2>
        <span className="gaffer-tape text-xs">{secured} of {vendors.length} booked</span>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{status}</p>

      <ul className="cue-card divide-y divide-[var(--line)]">
        {vendors.map((v) => (
          <li key={v.id} className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_9rem_8rem_10rem] gap-3 sm:items-end">
            <div>
              <span className="block text-xs uppercase tracking-wide text-[var(--muted)]">{v.category}</span>
              <span className="text-sm">{v.name}</span>
            </div>
            {editable ? (
              <>
                <label className="text-xs text-[var(--muted)]">Status
                  <select value={v.status} className={FIELD} onChange={(e) => void save(v, { status: e.target.value as VendorStatus })}>
                    {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="text-xs text-[var(--muted)]">Quote ($)
                  <input type="number" min={0} inputMode="decimal" defaultValue={v.quote ?? ""} className={FIELD}
                    onBlur={(e) => {
                      const quote = e.target.value === "" ? null : Number(e.target.value);
                      if (quote !== v.quote) void save(v, { quote });
                    }} />
                </label>
                <label className="text-xs text-[var(--muted)]">Deadline
                  <input type="date" defaultValue={v.deadline} className={FIELD}
                    onBlur={(e) => {
                      if (e.target.value !== v.deadline) void save(v, { deadline: e.target.value || null });
                    }} />
                </label>
              </>
            ) : (
              <>
                <span className="text-sm">{STATUS_LABEL[v.status]}</span>
                <span className="text-sm font-mono">{v.quote === null ? "No quote" : `$${v.quote.toLocaleString()}`}</span>
                <span className="text-sm font-mono">{v.deadline || "No deadline"}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
