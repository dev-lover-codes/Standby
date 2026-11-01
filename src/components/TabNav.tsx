"use client";

import React, { useRef } from "react";

export interface TabItem {
  id: string;
  label: string;
  cue: string;
  count?: number;
}

interface TabNavProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      onTabChange(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Event Rehearsal Sections"
      className="flex border-b-2 border-[var(--ink)] overflow-x-auto gap-1 no-scrollbar pt-2"
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`px-3 sm:px-4 py-2.5 font-mono text-xs sm:text-sm whitespace-nowrap border-t border-l border-r rounded-t transition-colors min-h-[44px] flex items-center gap-1.5 ${
              isActive
                ? "bg-[var(--card-bg)] text-[var(--ink)] border-[var(--ink)] font-bold -mb-[2px] border-b-2 border-b-[var(--card-bg)] z-10"
                : "bg-transparent text-[var(--muted)] border-transparent hover:text-[var(--ink)] hover:border-[var(--line)]"
            }`}
          >
            <span className="text-[10px] text-[var(--cue-red)] font-extrabold">{tab.cue}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-[var(--line)] text-[var(--ink)] rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
