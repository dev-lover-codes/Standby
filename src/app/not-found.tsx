import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-4">
      <div className="cue-card p-8 max-w-md text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-sm text-[var(--muted)]">
          This page or event does not exist, or it belongs to another account. Go back to your productions.
        </p>
        <Link href="/dashboard" className="btn btn-solid">Open productions</Link>
      </div>
    </main>
  );
}
