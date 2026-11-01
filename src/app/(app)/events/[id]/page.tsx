import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildEventView } from "@/lib/event-view";
import { EventViewClient } from "./EventViewClient";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("title").eq("id", id).maybeSingle();
  return { title: data ? `${data.title} | Standby` : "Event | Standby" };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=/events/${id}`);

  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!event) notFound();

  const [tasks, risks, vendors, budget] = await Promise.all([
    supabase.from("tasks").select("*").eq("event_id", id),
    supabase.from("risks").select("*").eq("event_id", id),
    supabase.from("vendors").select("*").eq("event_id", id).order("category"),
    supabase.from("budget_items").select("*").eq("event_id", id),
  ]);

  const view = buildEventView(event, {
    tasks: tasks.data ?? [],
    risks: risks.data ?? [],
    vendors: vendors.data ?? [],
    budget: budget.data ?? [],
  });

  return <EventViewClient view={view} />;
}
