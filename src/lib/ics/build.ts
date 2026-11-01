export interface IcsEventInput {
  id?: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  brief?: string;
}

export interface IcsTaskInput {
  id?: string;
  title: string;
  due_date?: string | null; // YYYY-MM-DD
  duration_days?: number;
}

export function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function foldLine(line: string): string {
  const maxOctets = 75;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);

  if (bytes.length <= maxOctets) {
    return line;
  }

  const chunks: string[] = [];
  let currentBytes = 0;
  let currentStr = "";
  let isFirst = true;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const limit = isFirst ? maxOctets : maxOctets - 1; // 1 byte reserved for space prefix

    if (currentBytes + charBytes > limit) {
      chunks.push(currentStr);
      currentStr = isFirst ? ` ${char}` : ` ${char}`;
      currentBytes = 1 + charBytes;
      isFirst = false;
    } else {
      currentStr += char;
      currentBytes += charBytes;
    }
  }

  if (currentStr.length > 0) {
    chunks.push(currentStr);
  }

  return chunks.join("\r\n");
}

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function nextDayDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function buildIcs(
  event: IcsEventInput,
  tasks: IcsTaskInput[],
  nowTimestamp: number = 1793527200000 // Stable default or current time
): string {
  const dtstamp = new Date(nowTimestamp)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const rawLines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Standby//Your event is rehearsed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  // Main Event VEVENT
  const eventUid = `standby-event-${event.id || "rehearsal"}@standby.app`;
  const eventDateFmt = formatDate(event.event_date);
  const eventEndFmt = nextDayDate(event.event_date);

  rawLines.push(
    "BEGIN:VEVENT",
    `UID:${eventUid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${eventDateFmt}`,
    `DTEND;VALUE=DATE:${eventEndFmt}`,
    `SUMMARY:${escapeIcsText(`[STANDBY] ${event.title}`)}`,
    `DESCRIPTION:${escapeIcsText(event.brief || "Production Rehearsal Event")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT"
  );

  // Task entries
  for (const task of tasks) {
    if (!task.due_date) continue;

    const taskSlug = task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const taskUid = `standby-task-${task.id || taskSlug}@standby.app`;
    const taskDateFmt = formatDate(task.due_date);
    const taskEndFmt = nextDayDate(task.due_date);

    rawLines.push(
      "BEGIN:VEVENT",
      `UID:${taskUid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${taskDateFmt}`,
      `DTEND;VALUE=DATE:${taskEndFmt}`,
      `SUMMARY:${escapeIcsText(`CUE: ${task.title}`)}`,
      `DESCRIPTION:${escapeIcsText(`Call Sheet deadline for: ${task.title}`)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  rawLines.push("END:VCALENDAR");

  // Apply folding and CRLF
  return rawLines.map(foldLine).join("\r\n") + "\r\n";
}
