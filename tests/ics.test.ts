import { describe, it, expect } from "vitest";
import { buildIcs, foldLine, escapeIcsText } from "@/lib/ics/build";

describe("RFC 5545 ICS Calendar Generator", () => {
  it("escapes special characters correctly per RFC 5545", () => {
    const raw = "Banquet, Dinner; with \\special\\ notes\nand newline";
    const escaped = escapeIcsText(raw);
    expect(escaped).toBe("Banquet\\, Dinner\\; with \\\\special\\\\ notes\\nand newline");
  });

  it("folds lines longer than 75 octets with CRLF space continuation", () => {
    const longLine =
      "DESCRIPTION:This is a very long descriptive text intended to test RFC 5545 octet folding mechanisms for stage management call sheets.";
    const folded = foldLine(longLine);
    const lines = folded.split("\r\n");

    expect(lines.length).toBeGreaterThan(1);
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i].startsWith(" ")).toBe(true);
    }
  });

  it("builds a complete, valid RFC 5545 calendar with CRLF line endings", () => {
    const event = {
      id: "ev-test-1",
      title: "Opening Gala Night",
      event_date: "2027-11-15",
      brief: "Black-tie theatrical rehearsal and premiere.",
    };

    const tasks = [
      { id: "t1", title: "Sound Check", due_date: "2027-11-10" },
      { id: "t2", title: "Lighting Rig", due_date: "2027-11-12" },
    ];

    const icsContent = buildIcs(event, tasks);

    expect(icsContent.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(icsContent.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(icsContent).toContain("VERSION:2.0\r\n");
    expect(icsContent).toContain("UID:standby-event-ev-test-1@standby.app");
    expect(icsContent).toContain("DTSTART;VALUE=DATE:20271115");
    expect(icsContent).toContain("DTEND;VALUE=DATE:20271116");
    expect(icsContent).toContain("UID:standby-task-t1@standby.app");
    expect(icsContent).toContain("UID:standby-task-t2@standby.app");
  });
});
