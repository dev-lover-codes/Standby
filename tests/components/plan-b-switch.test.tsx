import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanBSwitch } from "@/components/PlanBSwitch";

describe("PlanBSwitch Component", () => {
  it("renders PLAN A as active by default with Standby light ready", () => {
    const onScenarioChange = vi.fn();
    render(
      <PlanBSwitch currentScenario={null} onScenarioChange={onScenarioChange} />
    );

    const standbyStatus = screen.getByRole("status");
    expect(standbyStatus).toBeInTheDocument();

    const planARadio = screen.getByRole("radio", { name: /plan a/i });
    const planBRadio = screen.getByRole("radio", { name: /plan b/i });

    expect(planARadio).toHaveAttribute("aria-checked", "true");
    expect(planBRadio).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("group", { name: /simulate crisis scenario/i })).not.toBeInTheDocument();
  });

  it("switches to Plan B when PLAN B button is clicked", async () => {
    const user = userEvent.setup();
    const onScenarioChange = vi.fn();

    const { rerender } = render(
      <PlanBSwitch currentScenario={null} onScenarioChange={onScenarioChange} />
    );

    const planBRadio = screen.getByRole("radio", { name: /plan b/i });
    await user.click(planBRadio);

    expect(onScenarioChange).toHaveBeenCalledWith("rain");

    // Rerender with scenario = 'rain'
    rerender(
      <PlanBSwitch currentScenario="rain" onScenarioChange={onScenarioChange} />
    );

    expect(screen.getByRole("group", { name: /simulate crisis scenario/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rain plan/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("selects a different scenario when clicked in Plan B mode", async () => {
    const user = userEvent.setup();
    const onScenarioChange = vi.fn();

    render(
      <PlanBSwitch currentScenario="rain" onScenarioChange={onScenarioChange} />
    );

    const budgetCutBtn = screen.getByRole("button", { name: /budget cut 20%/i });
    await user.click(budgetCutBtn);

    expect(onScenarioChange).toHaveBeenCalledWith("budget_cut_20");
  });

  it("switches back to Plan A when PLAN A button is clicked", async () => {
    const user = userEvent.setup();
    const onScenarioChange = vi.fn();

    render(
      <PlanBSwitch currentScenario="rain" onScenarioChange={onScenarioChange} />
    );

    const planARadio = screen.getByRole("radio", { name: /plan a/i });
    await user.click(planARadio);

    expect(onScenarioChange).toHaveBeenCalledWith(null);
  });
});
