function pad(num) {
  return String(num).padStart(2, "0");
}

function formatUtcDate(date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z",
  ].join("");
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function getEventDescription(event) {
  const lines = [];

  if (event.teacher) lines.push(`Prof: ${event.teacher}`);
  if (event.type) lines.push(`Type: ${event.type}`);
  if (event.groups && event.groups.length > 0) {
    lines.push(`Groupes: ${event.groups.join(", ")}`);
  }
  if (event.description) lines.push(event.description);

  return lines.join("\n");
}

function normalizeEvents(events) {
  const seen = new Set();
  const normalized = [];

  for (const event of events || []) {
    const start =
      event?.start instanceof Date ? event.start : new Date(event?.start);
    const end = event?.end instanceof Date ? event.end : new Date(event?.end);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      continue;
    }

    const uniqueKey = `${event.id || "event"}-${start.toISOString()}-${end.toISOString()}`;
    if (seen.has(uniqueKey)) {
      continue;
    }
    seen.add(uniqueKey);

    normalized.push({ ...event, start, end });
  }

  return normalized;
}

export function createIcsFromEvents(events) {
  const now = new Date();
  const dtStamp = formatUtcDate(now);
  const normalizedEvents = normalizeEvents(events);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Better Zeus//Planning Export//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Better Zeus Planning",
  ];

  normalizedEvents.forEach((event, index) => {
    const uid = `${event.id || index}-${event.start.getTime()}@better-zeus`;
    const summary = escapeIcsText(event.title || "Cours Zeus");
    const description = escapeIcsText(getEventDescription(event));
    const location = escapeIcsText(event.location || "");
    const categories = escapeIcsText(event.type || "Course");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${formatUtcDate(event.start)}`);
    lines.push(`DTEND:${formatUtcDate(event.end)}`);
    lines.push(`SUMMARY:${summary}`);
    if (description) lines.push(`DESCRIPTION:${description}`);
    if (location) lines.push(`LOCATION:${location}`);
    if (categories) lines.push(`CATEGORIES:${categories}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadIcsFile(
  icsContent,
  fileName = "better-zeus-planning.ics",
) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
