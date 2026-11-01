import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "block",
});

export const metadata: Metadata = {
  title: "Standby | Your event is rehearsed",
  description:
    "A GenAI-powered planning assistant that helps users organize weddings, birthdays and community events with budgets, timelines, vendor checklists and personalized ideas.",
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Render per request so every page gets the CSP nonce set by the proxy.
  await connection();
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
