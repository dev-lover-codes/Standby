import type { Metadata } from "next";

export const metadata: Metadata = { title: "New event | Standby" };

export default function NewEventLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
