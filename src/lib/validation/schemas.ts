import { z } from "zod";

export const eventKindSchema = z.enum(["wedding", "birthday", "community", "other"]);
export type EventKind = z.infer<typeof eventKindSchema>;

export const vendorStatusSchema = z.enum(["to_call", "quoted", "booked", "confirmed"]);
export type VendorStatus = z.infer<typeof vendorStatusSchema>;

export const scenarioIdSchema = z.enum([
  "rain",
  "vendor_cancelled",
  "budget_cut_20",
  "guests_plus_30",
]);
export type ScenarioId = z.infer<typeof scenarioIdSchema>;

const sanitizeText = (val: string) => val.trim();

export const eventInputSchema = z.object({
  title: z.string().transform(sanitizeText).pipe(z.string().min(1, "Title is required").max(120, "Title too long")),
  kind: eventKindSchema,
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format")
    .refine((dateStr) => {
      const parts = dateStr.split("-").map(Number);
      const parsed = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      if (
        parsed.getUTCFullYear() !== parts[0] ||
        parsed.getUTCMonth() + 1 !== parts[1] ||
        parsed.getUTCDate() !== parts[2]
      ) {
        return false;
      }
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return parsed >= today;
    }, "Event date must be a valid calendar date today or in the future"),
  guest_count: z.number().int().min(1, "Must have at least 1 guest").max(5000, "Max 5,000 guests allowed"),
  budget_total: z.number().min(0, "Budget cannot be negative").max(1_000_000_000, "Exceeds max budget limit"),
  outdoor: z.boolean().default(false),
  brief: z.string().transform(sanitizeText).pipe(z.string().min(1, "Brief is required").max(1500, "Brief capped at 1,500 characters")),
});
export type EventInput = z.infer<typeof eventInputSchema>;

export const riskSchema = z.object({
  id: z.string().optional(),
  title: z.string().transform(sanitizeText).pipe(z.string().min(1).max(200)),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  plan_b: z.string().transform(sanitizeText).pipe(z.string().min(1).max(1000)),
});
export type Risk = z.infer<typeof riskSchema>;

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().transform(sanitizeText).pipe(z.string().min(1).max(200)),
  duration_days: z.number().int().min(1).max(365),
  depends_on: z.array(z.string()).default([]),
  due_date: z.string().nullable().optional(),
  done: z.boolean().default(false),
});
export type Task = z.infer<typeof taskSchema>;

export const vendorSchema = z.object({
  id: z.string().optional(),
  category: z.string().transform(sanitizeText).pipe(z.string().min(1).max(100)),
  name: z.string().transform(sanitizeText).pipe(z.string().max(120)).default(""),
  status: vendorStatusSchema.default("to_call"),
  quote: z.number().min(0).nullable().optional(),
  deadline: z.string().nullable().optional(),
});
export type Vendor = z.infer<typeof vendorSchema>;

export const budgetItemSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().transform(sanitizeText).pipe(z.string().min(1).max(120)),
    min_cost: z.number().min(0),
    likely_cost: z.number().min(0),
    max_cost: z.number().min(0),
    scales_with_guests: z.boolean().default(false),
  })
  .refine((val) => val.min_cost <= val.likely_cost && val.likely_cost <= val.max_cost, {
    message: "Cost ordering violation: min_cost <= likely_cost <= max_cost required",
    path: ["likely_cost"],
  });
export type BudgetItem = z.infer<typeof budgetItemSchema>;
