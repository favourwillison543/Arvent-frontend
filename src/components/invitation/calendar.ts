export type ReminderInput = {
    uid: string;
    title: string;
    date: string;
    startTime: string;
    endTime?: string;
    location: string;
    description: string;
    url: string;
  };
  
  const pad = (n: number) => String(n).padStart(2, "0");
  
  function stamp(date: string, time: string, addHours = 0) {
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = (time || "18:00").split(":").map(Number);
    const value = new Date(y, m - 1, d, h + addHours, min);
  
    return `${value.getFullYear()}${pad(value.getMonth() + 1)}${pad(
      value.getDate(),
    )}T${pad(value.getHours())}${pad(value.getMinutes())}00`;
  }
  
  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  
  /** UTC time, the shape calendar links (Google, Outlook) want. */
  function utcStamp(date: string, time: string, addHours = 0) {
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = (time || "18:00").split(":").map(Number);
    const value = new Date(y, m - 1, d, h + addHours, min);

    return `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(
      value.getUTCDate(),
    )}T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}00Z`;
  }

  /**
   * A "Remind me" link that drops the event into Google Calendar. When the guest
   * left an email it rides along as an attendee (`add`), so the reminder lands
   * in their own calendar instead of the browser's download folder.
   */
  export function googleCalendarUrl(input: ReminderInput, guestEmail?: string) {
    if (!input.date) return "";

    const end = input.endTime
      ? utcStamp(input.date, input.endTime)
      : utcStamp(input.date, input.startTime, 3);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: input.title,
      dates: `${utcStamp(input.date, input.startTime)}/${end}`,
      details: [input.description, input.url].filter(Boolean).join("\n\n"),
      location: input.location,
    });

    if (guestEmail) params.set("add", guestEmail);

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /** The plain-text reminder a guest sends to their own WhatsApp chat. */
  export function reminderMessage(input: ReminderInput, when?: string) {
    return [
      `Reminder: ${input.title}`,
      when ? `When: ${when}` : "",
      input.location ? `Where: ${input.location}` : "",
      input.url ? `Invitation: ${input.url}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  export function downloadReminder(input: ReminderInput) {
    if (!input.date) return;
  
    const end = input.endTime
      ? stamp(input.date, input.endTime)
      : stamp(input.date, input.startTime, 3);
  
    const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Arvent//Invitation//EN",
      "BEGIN:VEVENT",
      `UID:${input.uid}@arvent`,
      `DTSTAMP:${now}Z`,
      `DTSTART:${stamp(input.date, input.startTime)}`,
      `DTEND:${end}`,
      `SUMMARY:${escape(input.title)}`,
      `LOCATION:${escape(input.location)}`,
      `DESCRIPTION:${escape(`${input.description}\n${input.url}`.trim())}`,
      `URL:${input.url}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Event reminder",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
  
    const blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
  
    link.href = href;
    link.download = `${input.uid}.ics`;
    link.click();
  
    URL.revokeObjectURL(href);
  }