import type { AiPlan, AiPreMortem, AiGuestPanel, AiScenarioExplain } from "./schemas";
import type { PromptContext } from "./prompts";

export function getFallbackPlan(ctx: PromptContext): AiPlan {
  const budget = Math.max(1000, ctx.budget_total);
  const guests = Math.max(10, ctx.guest_count);
  const kind = ctx.kind || "community";

  if (kind === "wedding") {
    return {
      summary: `Comprehensive wedding production plan for ${guests} guests focused on romantic ambience, seamless guest flow, and rehearsed cues.`,
      tasks: [
        { title: "Select & reserve ceremonial and reception venue", duration_days: 14, depends_on_titles: [] },
        { title: "Engage lead photographer and visual chronicler", duration_days: 7, depends_on_titles: ["Select & reserve ceremonial and reception venue"] },
        { title: "Curate tasting menu and dietary station selections", duration_days: 10, depends_on_titles: ["Select & reserve ceremonial and reception venue"] },
        { title: "Design and dispatch formal physical invitations", duration_days: 21, depends_on_titles: ["Select & reserve ceremonial and reception venue"] },
        { title: "Finalize acoustic quartet & reception entertainment", duration_days: 7, depends_on_titles: ["Select & reserve ceremonial and reception venue"] },
        { title: "Floral styling, arch fabrication & tablescape mock-up", duration_days: 7, depends_on_titles: ["Curate tasting menu and dietary station selections"] },
        { title: "Conduct full ceremonial walkthrough & dress rehearsal", duration_days: 2, depends_on_titles: ["Finalize acoustic quartet & reception entertainment", "Floral styling, arch fabrication & tablescape mock-up"] },
      ],
      budget_items: [
        { name: "Venue Hire & Private Suites", min: Math.round(budget * 0.28), likely: Math.round(budget * 0.32), max: Math.round(budget * 0.38), scales_with_guests: false },
        { name: "Catering & Signature Cocktails", min: Math.round((budget * 0.25) / guests), likely: Math.round((budget * 0.32) / guests), max: Math.round((budget * 0.38) / guests), scales_with_guests: true },
        { name: "Photography & Cine Coverage", min: Math.round(budget * 0.1), likely: Math.round(budget * 0.14), max: Math.round(budget * 0.18), scales_with_guests: false },
        { name: "Floral Installations & Styling", min: Math.round(budget * 0.08), likely: Math.round(budget * 0.1), max: Math.round(budget * 0.14), scales_with_guests: false },
        { name: "Live Music & Sound Engineering", min: Math.round(budget * 0.06), likely: Math.round(budget * 0.08), max: Math.round(budget * 0.11), scales_with_guests: false },
        { name: "Day-of Stage Management & Gratuities", min: Math.round(budget * 0.04), likely: Math.round(budget * 0.06), max: Math.round(budget * 0.08), scales_with_guests: false },
      ],
      vendors: [
        { category: "Venue Management", tip: "Verify curfew, noise ordinance restrictions, and vendor loading dock rules." },
        { category: "Catering & Banquet", tip: "Request a guaranteed minimum plate policy and sample allergy signage." },
        { category: "Photography", tip: "Provide shot list of family elders and critical unrepeatable cues." },
        { category: "Florals & Production", tip: "Confirm repurposing of ceremony flowers to evening reception tables." },
      ],
      ideas: [
        { title: "Audio Guestbook Station", why: "Vintage telephone booth where guests record voice memos throughout the evening." },
        { title: "Late-Night Comfort Snack Box", why: "Surprise midnight sliders and warm churros served during final dance cues." },
        { title: "Polaroid Rehearsal Wall", why: "Instant snapshot timeline documenting setup behind-the-scenes into the evening." },
        { title: "Bespoke Cultural Welcome Drink", why: "Ties directly to family heritage with personalized parchment story cards." },
        { title: "Live Painter Keepsake", why: "An artist paints the ceremonial vows in real time as an heirloom art piece." },
      ],
    };
  }

  if (kind === "birthday") {
    return {
      summary: `Vibrant celebration for ${guests} guests featuring dynamic lighting, interactive games, and bespoke culinary touches.`,
      tasks: [
        { title: "Confirm venue lounge or event hall booking", duration_days: 7, depends_on_titles: [] },
        { title: "Lock in DJ or playlist sound curation", duration_days: 5, depends_on_titles: ["Confirm venue lounge or event hall booking"] },
        { title: "Order custom sculpted centerpiece cake", duration_days: 10, depends_on_titles: ["Confirm venue lounge or event hall booking"] },
        { title: "Send digital invitations & collect dietary preferences", duration_days: 14, depends_on_titles: ["Confirm venue lounge or event hall booking"] },
        { title: "Acquire ambient lighting, neon signs & photo backdrop", duration_days: 4, depends_on_titles: ["Confirm venue lounge or event hall booking"] },
        { title: "Assemble guest favor bags & game prizes", duration_days: 3, depends_on_titles: ["Send digital invitations & collect dietary preferences"] },
        { title: "Complete soundcheck and timeline review", duration_days: 1, depends_on_titles: ["Lock in DJ or playlist sound curation", "Acquire ambient lighting, neon signs & photo backdrop"] },
      ],
      budget_items: [
        { name: "Lounge Venue Space", min: Math.round(budget * 0.25), likely: Math.round(budget * 0.3), max: Math.round(budget * 0.35), scales_with_guests: false },
        { name: "Party Catering & Canapés", min: Math.round((budget * 0.25) / guests), likely: Math.round((budget * 0.3) / guests), max: Math.round((budget * 0.38) / guests), scales_with_guests: true },
        { name: "Artisan Cake & Sweets", min: Math.round(budget * 0.08), likely: Math.round(budget * 0.1), max: Math.round(budget * 0.15), scales_with_guests: false },
        { name: "DJ & Sound System Rental", min: Math.round(budget * 0.1), likely: Math.round(budget * 0.14), max: Math.round(budget * 0.18), scales_with_guests: false },
        { name: "Atmospheric Lighting & Photo Booth", min: Math.round(budget * 0.08), likely: Math.round(budget * 0.12), max: Math.round(budget * 0.16), scales_with_guests: false },
        { name: "Interactive Games & Host Props", min: Math.round(budget * 0.04), likely: Math.round(budget * 0.06), max: Math.round(budget * 0.08), scales_with_guests: false },
      ],
      vendors: [
        { category: "Venue Host", tip: "Confirm auxiliary speaker connectivity and HDMI projector capabilities." },
        { category: "Pastry Chef", tip: "Ensure temperature-controlled storage space on site prior to cutting." },
        { category: "Sound & DJ", tip: "Establish a strict do-not-play list and highlight favorite anthems." },
        { category: "Photographer", tip: "Position photographer near cake reveal for genuine emotional reactions." },
      ],
      ideas: [
        { title: "Custom Trivia Rehearsal", why: "Engaging crowd quiz featuring lighthearted milestones and inside jokes." },
        { title: "Signature Mocktail Station", why: "Interactive beverage station with herbs, smoking citrus, and custom glass labels." },
        { title: "Time Capsule Guest Messages", why: "Guests deposit sealed letters to be opened on a future milestone birthday." },
        { title: "Glow Stick Dance Countdown", why: "Synchronized illumination when key DJ tracks transition." },
        { title: "Late Night Fry Bar", why: "Hot seasoned fries served in personalized cue sheet paper cones." },
      ],
    };
  }

  // Default: Community & Other
  return {
    summary: `Structured community production plan for ${guests} attendees emphasizing broad accessibility, volunteer coordination, and dependable logistics.`,
    tasks: [
      { title: "Secure municipal park or community hall permit", duration_days: 14, depends_on_titles: [] },
      { title: "Coordinate volunteer crew leaders and stage shifts", duration_days: 7, depends_on_titles: ["Secure municipal park or community hall permit"] },
      { title: "Arrange PA sound system and generator power", duration_days: 5, depends_on_titles: ["Secure municipal park or community hall permit"] },
      { title: "Confirm local food truck vendors and water stations", duration_days: 10, depends_on_titles: ["Secure municipal park or community hall permit"] },
      { title: "Launch neighborhood flyers and digital community board notices", duration_days: 14, depends_on_titles: ["Secure municipal park or community hall permit"] },
      { title: "Set up safety barricades, waste sorting, and first-aid post", duration_days: 2, depends_on_titles: ["Arrange PA sound system and generator power"] },
      { title: "Morning walk-through and technical cue rehearsal", duration_days: 1, depends_on_titles: ["Coordinate volunteer crew leaders and stage shifts", "Set up safety barricades, waste sorting, and first-aid post"] },
    ],
    budget_items: [
      { name: "Facility Permitting & City Sanitation", min: Math.round(budget * 0.15), likely: Math.round(budget * 0.2), max: Math.round(budget * 0.25), scales_with_guests: false },
      { name: "Public Sound System & Microphones", min: Math.round(budget * 0.15), likely: Math.round(budget * 0.2), max: Math.round(budget * 0.25), scales_with_guests: false },
      { name: "Hydration & Community Refreshments", min: Math.round((budget * 0.15) / guests), likely: Math.round((budget * 0.22) / guests), max: Math.round((budget * 0.3) / guests), scales_with_guests: true },
      { name: "Shade Tents, Tables & Benches", min: Math.round(budget * 0.15), likely: Math.round(budget * 0.18), max: Math.round(budget * 0.22), scales_with_guests: false },
      { name: "Signage, Wayfinding & Programs", min: Math.round(budget * 0.05), likely: Math.round(budget * 0.08), max: Math.round(budget * 0.12), scales_with_guests: false },
      { name: "First Aid & Volunteer Care Supplies", min: Math.round(budget * 0.05), likely: Math.round(budget * 0.07), max: Math.round(budget * 0.1), scales_with_guests: false },
    ],
    vendors: [
      { category: "Equipment Rental", tip: "Schedule delivery 3 hours early to verify generator cable gauges." },
      { category: "Waste Management", tip: "Place clear three-stream sorting bins directly adjacent to food areas." },
      { category: "Sound Technician", tip: "Run radio-frequency scan to prevent wireless mic interference." },
      { category: "Local Refreshments", tip: "Guarantee allergen-free and accessible hydration containers." },
    ],
    ideas: [
      { title: "Community Talent Showcase", why: "Short 5-minute performance cues celebrating local neighborhood artists." },
      { title: "Collaborative Mural Canvas", why: "Community members paint small designated blocks to create a permanent banner." },
      { title: "Storytelling Listening Bench", why: "Shaded quiet nook where elders and youth record oral histories." },
      { title: "Seedling Exchange Nook", why: "Guests bring and swap home garden plant clippings." },
      { title: "Volunteer Recognition Spotlight", why: "Brief public recognition thanking crew leads with paper stage certificates." },
    ],
  };
}

export function getFallbackPreMortem(): AiPreMortem {
  return {
    risks: [
      {
        title: "Sound System Feedback or Power Outage",
        likelihood: 3,
        impact: 4,
        plan_b: "Maintain a battery-powered emergency megaphone and secondary isolated circuit breakers.",
      },
      {
        title: "Adverse Weather or Sudden Downpour",
        likelihood: 4,
        impact: 4,
        plan_b: "Reserve pop-up waterproof marquee canopies with sandbag weights on 2-hour standby.",
      },
      {
        title: "Key Vendor Arrives Behind Schedule",
        likelihood: 3,
        impact: 4,
        plan_b: "Schedule all setup calls 90 minutes before doors open and assign a dedicated backstage expeditor.",
      },
      {
        title: "Catering Underestimation Due to RSVP Surge",
        likelihood: 3,
        impact: 3,
        plan_b: "Pre-authorize local artisan bakery for emergency flatbread and antipasti platters within 30 minutes.",
      },
      {
        title: "Parking or Transit Bottleneck at Entry",
        likelihood: 3,
        impact: 3,
        plan_b: "Deploy volunteer marshals in high-visibility vests with printed wayfinding cards.",
      },
    ],
  };
}

export function getFallbackGuestPanel(): AiGuestPanel {
  return {
    personas: [
      {
        name: "Grandparent Harold",
        role: "Strict Grandparent (78 yrs)",
        concern: "Music volume and lack of comfortable armchairs away from loudspeakers.",
        suggestion: "Designate a quiet acoustic salon with cushioned seating and clear sightlines.",
        plan_part: "venue",
      },
      {
        name: "Maya Chen",
        role: "Vegan Guest & Friend",
        concern: "Accidental cross-contact with animal fats and insufficient protein in vegetarian dishes.",
        suggestion: "Color-code buffet tongs and clearly label ingredient cards at all serving stations.",
        plan_part: "food",
      },
      {
        name: "Sarah & Toddler Leo",
        role: "Parent with Toddler (2 yrs)",
        concern: "No private nursing or diaper changing table, and long delays before food service.",
        suggestion: "Provide baby changing station in family restroom and offer fruit skewers early.",
        plan_part: "timeline",
      },
      {
        name: "Marcus Taylor",
        role: "Wheelchair User",
        concern: "Steep threshold steps at entrance and grass paths after rainfall.",
        suggestion: "Install certified 1:12 modular threshold ramp and lay firm interlocking floor tiles.",
        plan_part: "venue",
      },
    ],
    accessibility_checks: [
      { item: "Step-free entrance and ramps", status: "ok", note: "Ramps verified with non-slip grip treads." },
      { item: "ADA compliant restroom stall", status: "ok", note: "Door swing and grab rails confirmed." },
      { item: "Dietary and allergen labeling", status: "fix", note: "Need high-contrast printed table tents for nuts & gluten." },
      { item: "Clear audio frequency & low echo", status: "ok", note: "Acoustic panels positioned behind speakers." },
    ],
  };
}

export function getFallbackScenarioExplain(scenarioId: string, changes: string[]): AiScenarioExplain {
  return {
    headline: `Plan B Engaged: ${scenarioId.toUpperCase().replace(/_/g, " ")}`,
    changes_summary: changes.slice(0, 3),
    advice: "Stay calm and communicate cues clearly to all stage personnel. Follow revised checklist items.",
  };
}
