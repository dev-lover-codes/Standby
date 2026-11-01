import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabNav, type TabItem } from "@/components/TabNav";

describe("TabNav Component (ARIA Tabs)", () => {
  const sampleTabs: TabItem[] = [
    { id: "call-sheet", label: "Call Sheet", cue: "Q1", count: 7 },
    { id: "pre-mortem", label: "Pre-Mortem", cue: "Q2", count: 5 },
    { id: "money", label: "Money", cue: "Q3" },
    { id: "vendors", label: "Vendors", cue: "Q4", count: 4 },
  ];

  it("renders tabs with proper ARIA attributes", () => {
    const onTabChange = vi.fn();
    render(
      <TabNav tabs={sampleTabs} activeTab="call-sheet" onTabChange={onTabChange} />
    );

    const tabList = screen.getByRole("tablist", { name: /event rehearsal sections/i });
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);

    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
  });

  it("changes tab on click", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <TabNav tabs={sampleTabs} activeTab="call-sheet" onTabChange={onTabChange} />
    );

    const preMortemTab = screen.getByRole("tab", { name: /pre-mortem/i });
    await user.click(preMortemTab);

    expect(onTabChange).toHaveBeenCalledWith("pre-mortem");
  });

  it("navigates tabs using ArrowRight and ArrowLeft keyboard keys", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <TabNav tabs={sampleTabs} activeTab="call-sheet" onTabChange={onTabChange} />
    );

    const firstTab = screen.getByRole("tab", { name: /call sheet/i });
    firstTab.focus();

    await user.keyboard("{ArrowRight}");
    expect(onTabChange).toHaveBeenCalledWith("pre-mortem");

    await user.keyboard("{ArrowLeft}");
    expect(onTabChange).toHaveBeenCalledWith("call-sheet");
  });

  it("navigates to first/last tab with Home and End keys", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <TabNav tabs={sampleTabs} activeTab="pre-mortem" onTabChange={onTabChange} />
    );

    const secondTab = screen.getByRole("tab", { name: /pre-mortem/i });
    secondTab.focus();

    await user.keyboard("{End}");
    expect(onTabChange).toHaveBeenCalledWith("vendors");

    await user.keyboard("{Home}");
    expect(onTabChange).toHaveBeenCalledWith("call-sheet");
  });
});
