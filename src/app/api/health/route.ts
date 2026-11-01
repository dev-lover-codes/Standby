import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const time = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("ping");

    if (error || data !== "pong") {
      return NextResponse.json(
        { ok: false, error: "Database unavailable", time },
        { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      { ok: true, time },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Health check failed", time },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
