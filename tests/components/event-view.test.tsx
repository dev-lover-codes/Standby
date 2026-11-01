import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildEventView } from "@/lib/event-view";

const explain = vi.fn();
const updateVendor = vi.fn();
const setTaskDone = vi.fn();
vi.mock("@/app/feature-actions", () => ({
  explainScenarioAction: (...a: unknown[]) => explain(...a),
  updateVendorAction: (...a: unknown[]) => updateVendor(...a),
  setTaskDoneAction: (...a: unknown[]) => setTaskDone(...a),
  rerunPreMortemAction: vi.fn(async () => ({ success: true, source: "fallback" })),
  rerunGuestPanelAction: vi.fn(async () => ({ success: true, source: "ai" })),
}));
vi.mock("@/app/actions", () => ({ createShareLinkAction: vi.fn() }));
vi.mock("next/dynamic", () => ({ default: () => () => <div>histogram</div> }));

const { EventViewClient } = await import("@/app/(app)/events/[id]/EventViewClient");

const TASK_ID = "11111111-1111-4111-8111-111111111111";
const VENDOR_ID = "22222222-2222-4222-8222-222222222222";
const view = buildEventView(
  { id: "33333333-3333-4333-8333-333333333333", title: "Garden party", kind: "birthday", event_date: "2031-06-01",
    guest_count: 40, budget_total: 5000, outdoor: true, brief: "Sunny garden", plan: null },
  {
    tasks: [{ id: TASK_ID, title: "Book caterer", duration_days: 5, depends_on: [], done: false }],
    risks: [],
    vendors: [{ id: VENDOR_ID, category: "Catering", name: "Ask about vegan menu", status: "to_call", quote: null, deadline: null }],
    budget: [],
  }
);

describe("EventViewClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves a ticked task", async () => {
    setTaskDone.mockResolvedValueOnce({ success: true });
    render(<EventViewClient view={view} />);
    await userEvent.click(screen.getByLabelText(/book caterer/i));
    expect(setTaskDone).toHaveBeenCalledWith(TASK_ID, true);
  });

  it("applies Plan B and shows the AI explanation", async () => {
    explain.mockResolvedValueOnce({ success: true, data: { headline: "Rain ready", changes_summary: [], advice: "Book the tent." } });
    render(<EventViewClient view={view} />);
    await userEvent.click(screen.getByRole("radio", { name: /plan b/i }));
    expect(screen.getByRole("heading", { name: /plan b is active/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/book the tent/i)).toBeInTheDocument());
    expect(explain).toHaveBeenCalledWith("rain", expect.any(Array));
  });

  it("saves vendor status and shows template notices", async () => {
    updateVendor.mockResolvedValueOnce({ success: true });
    render(<EventViewClient view={view} />);
    await userEvent.click(screen.getByRole("tab", { name: /vendors/i }));
    await userEvent.selectOptions(screen.getByLabelText(/status/i), "booked");
    expect(updateVendor).toHaveBeenCalledWith(VENDOR_ID, { status: "booked" });

    await userEvent.click(screen.getByRole("tab", { name: /pre-mortem/i }));
    expect(screen.getAllByText(/RISK \d\/5/)).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: /run pre-mortem again/i }));
    await waitFor(() => expect(screen.getByText(/safe template was used/i)).toBeInTheDocument());
  });
});
