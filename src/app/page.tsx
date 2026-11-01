import type { Metadata } from "next";
import Link from "next/link";
import { LandingBar } from "@/components/landing/LandingBar";
import { LandingEffects } from "@/components/landing/LandingEffects";
import "./landing.css";
import "./landing-intro.css";

const ASSET_BASE = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";
const VIDEO_URL = `${ASSET_BASE}/4b73c700-3112-4c07-bd48-0af2893dff7c.mp4`;
const POSTER_URL = `${ASSET_BASE}/0bf7409c-9fa2-4bef-a49d-34903dcc91ad.png`;
const NO_JS_CSS =
  ".frame.intro .brand,.frame.intro .links a,.frame.intro .btn,.frame.intro .menu,.frame.intro .pill,.frame.intro .hero p{opacity:1}.frame.intro .ln-i{transform:none}";

export const metadata: Metadata = {
  title: "Standby — Your event is rehearsed",
  description:
    "Budget, timeline, vendor checklist and personalized ideas for weddings, birthdays and community events.",
};

export default function Home() {
  return (
    <div className="frame intro">
      <noscript>
        <style>{NO_JS_CSS}</style>
      </noscript>
      <video
        className="sky"
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER_URL}
        src={VIDEO_URL}
      />
      <div className="veil" />
      <LandingBar />

      <div className="screen">
        <main className="hero" id="main-content">
          <Link className="pill" href="/events/new">
            <span className="chip">New</span>
            <span className="pill-label">Plan B in one click</span>
            <svg viewBox="0 0 9.5 8" fill="none" aria-hidden="true">
              <path
                d="M0.7 4H8.8M5.6 0.75 8.85 4 5.6 7.25"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <h1>
            <span className="ln"><span className="ln-i">Standby.</span></span>
            <span className="ln"><span className="ln-i">Your event is rehearsed.</span></span>
          </h1>

          <p>Budget, timeline, vendor checklist and personalized ideas for every celebration.</p>

          <div className="cta">
            <Link className="btn ghost" href="/login">Try as guest</Link>
            <Link className="btn solid" href="/events/new">Plan event</Link>
          </div>
        </main>
      </div>
      <LandingEffects />
    </div>
  );
}
