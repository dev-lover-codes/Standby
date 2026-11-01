import type { BudgetItem, Task, Vendor, Risk } from "../validation/schemas";

export interface RehearsalEventState {
  event: {
    id?: string;
    title: string;
    kind: "wedding" | "birthday" | "community" | "other";
    event_date: string;
    guest_count: number;
    budget_total: number;
    outdoor: boolean;
    brief: string;
    plan?: unknown;
  };
  tasks: Task[];
  risks: Risk[];
  vendors: Vendor[];
  budget_items: BudgetItem[];
}

export type ScenarioType = "rain" | "vendor_cancelled" | "budget_cut_20" | "guests_plus_30";

export interface ScenarioApplicationResult {
  nextState: RehearsalEventState;
  changes: string[];
}

export function applyScenario(
  state: RehearsalEventState,
  scenarioId: ScenarioType
): ScenarioApplicationResult {
  // Deep clone to guarantee purity
  const nextEvent = { ...state.event };
  const nextTasks = state.tasks.map((t) => ({ ...t, depends_on: [...t.depends_on] }));
  const nextRisks = state.risks.map((r) => ({ ...r }));
  const nextVendors = state.vendors.map((v) => ({ ...v }));
  const nextBudgetItems = state.budget_items.map((b) => ({ ...b }));

  const changes: string[] = [];

  switch (scenarioId) {
    case "rain": {
      nextEvent.outdoor = false;
      changes.push("Switched venue plan from outdoor to covered layout");

      const tentTask: Task = {
        id: "task-scenario-rain-tent",
        title: "Procure waterproof canopy and marquee sidewalls",
        duration_days: 2,
        depends_on: [],
        done: false,
      };
      const soundTask: Task = {
        id: "task-scenario-rain-audio",
        title: "Relocate audio mixing board and power distribution to dry zone",
        duration_days: 1,
        depends_on: ["task-scenario-rain-tent"],
        done: false,
      };
      nextTasks.push(tentTask, soundTask);
      changes.push("Added task: Procure waterproof canopy and marquee sidewalls");
      changes.push("Added task: Relocate audio mixing board to dry zone");

      const rainBudget: BudgetItem = {
        id: "budget-scenario-rain",
        name: "Weather Contingency Canopy & Heaters",
        min_cost: 600,
        likely_cost: 1000,
        max_cost: 1500,
        scales_with_guests: false,
      };
      nextBudgetItems.push(rainBudget);
      changes.push("Added budget item: Weather Contingency Canopy & Heaters");

      nextRisks.push({
        id: "risk-scenario-rain",
        title: "Slippery outdoor access paths during rainfall",
        likelihood: 4,
        impact: 3,
        plan_b: "Lay non-slip stage runner mats and position umbrella stations at entry",
      });
      changes.push("Added risk: Slippery access paths with rubber matting Plan B");
      break;
    }

    case "vendor_cancelled": {
      if (nextVendors.length > 0) {
        const targetVendor = nextVendors[0];
        targetVendor.status = "to_call";
        targetVendor.name = targetVendor.name
          ? `${targetVendor.name} (CANCELLED - REPLACEMENT NEEDED)`
          : "Urgent Replacement Needed";
        changes.push(`Marked ${targetVendor.category} vendor as cancelled`);
      }

      const replacementTask: Task = {
        id: "task-scenario-vendor-audit",
        title: "Emergency vendor dispatch: contact second-choice shortlisted vendor",
        duration_days: 2,
        depends_on: [],
        done: false,
      };
      nextTasks.push(replacementTask);
      changes.push("Added task: Emergency vendor dispatch & rush contract negotiation");

      // Apply 15% rush fee increase to first matching budget item
      if (nextBudgetItems.length > 0) {
        const item = nextBudgetItems[0];
        item.likely_cost = Math.round(item.likely_cost * 1.15 * 100) / 100;
        item.max_cost = Math.round(item.max_cost * 1.25 * 100) / 100;
        changes.push(`Adjusted ${item.name} budget (+15% emergency rush buffer)`);
      }
      break;
    }

    case "budget_cut_20": {
      nextEvent.budget_total = Math.round(nextEvent.budget_total * 0.8 * 100) / 100;
      changes.push(`Reduced total production budget by 20% to ${nextEvent.budget_total}`);

      for (const item of nextBudgetItems) {
        item.min_cost = Math.round(item.min_cost * 0.8 * 100) / 100;
        item.likely_cost = Math.round(item.likely_cost * 0.8 * 100) / 100;
        item.max_cost = Math.round(item.max_cost * 0.8 * 100) / 100;
      }
      changes.push("Scaled down all budget line items by 20% across the board");

      nextRisks.push({
        id: "risk-scenario-budget-cut",
        title: "20% Budget austerity compromises decorative and lighting scope",
        likelihood: 4,
        impact: 4,
        plan_b: "Switch to ambient acoustic staging and minimalist botanical greenery",
      });
      changes.push("Added risk: 20% budget reduction mitigation");
      break;
    }

    case "guests_plus_30": {
      const prevGuests = nextEvent.guest_count;
      nextEvent.guest_count += 30;
      changes.push(`Increased guest count from ${prevGuests} to ${nextEvent.guest_count} (+30 attendees)`);

      const seatingTask: Task = {
        id: "task-scenario-extra-guests",
        title: "Reconfigure banquet floorplan and order 3 additional round tables",
        duration_days: 1,
        depends_on: [],
        done: false,
      };
      nextTasks.push(seatingTask);
      changes.push("Added task: Reconfigure banquet floorplan for +30 attendees");

      let scaledCount = 0;
      for (const item of nextBudgetItems) {
        if (item.scales_with_guests) {
          const ratio = (prevGuests + 30) / Math.max(1, prevGuests);
          item.min_cost = Math.round(item.min_cost * ratio * 100) / 100;
          item.likely_cost = Math.round(item.likely_cost * ratio * 100) / 100;
          item.max_cost = Math.round(item.max_cost * ratio * 100) / 100;
          scaledCount++;
        }
      }
      changes.push(`Automatically scaled ${scaledCount} per-guest catering & service budget line items`);
      break;
    }
  }

  return {
    nextState: {
      event: nextEvent,
      tasks: nextTasks,
      risks: nextRisks,
      vendors: nextVendors,
      budget_items: nextBudgetItems,
    },
    changes,
  };
}
