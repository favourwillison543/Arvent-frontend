/* Arvent's email shell.
 *
 * Email HTML is not web HTML: no flexbox, no grid, no external stylesheet, no
 * webfonts worth relying on. So this is the old, boring way on purpose — nested
 * tables, inline styles, a 600px card that stretches to the screen — and it is
 * the only way the same design survives Gmail, Outlook and a phone.
 *
 * Everything a template puts inside the card is escaped at the edge: names,
 * event titles and update bodies are guest or host input.
 */

import { SITE_URL } from "@/lib/site";

export const BRAND = {
  page: "#f2efe6",
  card: "#ffffff",
  ink: "#18181b",
  soft: "#4a463c",
  faint: "#7a7568",
  line: "#e6e2d6",
  lime: "#dcf91c",
  limeInk: "#18181b",
  chipGoing: "#e8f7ef",
  chipMaybe: "#fdf2df",
  chipNo: "#fde8ec",
} as const;

/* The web app's own address — what a link in an email starts with. */
export const APP_URL = SITE_URL;

const FONT =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* The display face. Outlook and Gmail drop the webfont and fall back to the
   body stack above, which is what the product's own `font-display` fallback does
   in a browser that cannot load Bricolage. */
const DISPLAY = `'Bricolage Grotesque', ${FONT}`;

/** Email clients render whatever you give them; escape everything from outside. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.6;color:${BRAND.soft};">${esc(
          block,
        ).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

/** A label/value list — date, time, venue. Stacks on a narrow screen. */
export function detailCard(rows: { label: string; value: string }[]): string {
  const body = rows
    .filter((row) => row.value)
    .map(
      (row, index) => `<tr>
        <td class="sm-stack" style="width:92px;padding:0 12px 0 0;vertical-align:top;font-family:${FONT};font-size:14px;font-weight:400;color:${BRAND.faint};${
          index ? "padding-top:10px;" : ""
        }">${esc(row.label)}</td>
        <td class="sm-stack" style="padding:0;vertical-align:top;font-family:${FONT};font-size:15px;font-weight:500;line-height:1.5;color:${BRAND.ink};${
          index ? "padding-top:10px;" : ""
        }">${esc(row.value)}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;border:1px solid ${BRAND.line};border-radius:14px;background:#fbfaf5;">
    <tr>
      <td style="padding:18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table></td>
    </tr>
  </table>`;
}

/**
 * A bulletproof button: the anchor is padded and coloured, and a table cell
 * behind it carries the lime fill, so Outlook — which drops padding on anchors —
 * still draws a button.
 */
export function primaryButton({ href, label }: { href: string; label: string }) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="sm-full" style="margin:0 0 14px;">
    <tr>
      <td align="center" bgcolor="${BRAND.lime}" style="border-radius:999px;border:2px solid ${BRAND.ink};">
        <a href="${esc(href)}" style="display:block;padding:13px 28px;font-family:${FONT};font-size:15px;font-weight:600;line-height:1.2;color:${BRAND.limeInk};text-decoration:none;border-radius:999px;">${esc(
          label,
        )}</a>
      </td>
    </tr>
  </table>`;
}

export function textLink({ href, label }: { href: string; label: string }) {
  return `<p style="margin:0 0 6px;font-family:${FONT};font-size:14px;line-height:1.5;">
    <a href="${esc(href)}" style="color:${BRAND.ink};font-weight:600;text-decoration:underline;">${esc(
      label,
    )}</a>
  </p>`;
}

/** A status chip: the guest's answer, in the colour the app uses for it. */
export function chip(label: string, tone: "going" | "maybe" | "no" | "plain") {
  const background =
    tone === "going"
      ? BRAND.chipGoing
      : tone === "maybe"
        ? BRAND.chipMaybe
        : tone === "no"
          ? BRAND.chipNo
          : "#f1efe7";

  return `<span style="display:inline-block;padding:5px 12px;border-radius:999px;background:${background};font-family:${FONT};font-size:13px;font-weight:500;color:${BRAND.ink};">${esc(
    label,
  )}</span>`;
}

/** Quiet type under a button: what not to do with a personal link. */
export function smallNote(text: string) {
  return `<p style="margin:12px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${BRAND.faint};">${esc(
    text,
  )}</p>`;
}

/**
 * The wordmark — the same `/brand/arvent-wordmark.svg` the site draws, at the
 * absolute address an email needs. A client that blocks images still shows
 * "Arvent" through the alt text, so nothing depends on the picture loading.
 */
function wordmark() {
  return `<img src="${esc(
    `${APP_URL}/brand/arvent-wordmark.svg`,
  )}" width="112" height="28" alt="Arvent" style="display:block;width:112px;height:28px;border:0;outline:none;text-decoration:none;font-family:${FONT};font-size:17px;font-weight:600;color:${BRAND.ink};" />`;
}


export function emailShell({
  subject,
  preheader,
  status,
  title,
  content,
  footerNote,
  tone = "plain",
}: {
  subject: string;
  preheader: string;
  status?: string;
  title: string;
  content: string;
  footerNote?: string;
  tone?: "going" | "maybe" | "no" | "plain";
}) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
    <title>${esc(subject)}</title>
    <!--[if mso]>
      <style>
        body, table, td, p, a { font-family: Arial, Helvetica, sans-serif !important; }
      </style>
    <![endif]-->
    <style>
      /* The two things inline styles cannot do: stack the detail rows on a
         phone, and let the button go full width there. */
      @media screen and (max-width: 480px) {
        .sm-card { padding: 22px !important; }
        .sm-full { width: 100% !important; }
        .sm-stack {
          display: block !important;
          width: 100% !important;
          padding: 0 !important;
        }
        .sm-stack + .sm-stack { padding-top: 4px !important; }
        .sm-title { font-size: 22px !important; line-height: 1.25 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.page};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${esc(preheader)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.page}" style="background:${BRAND.page};">
      <tr>
        <td align="center" style="padding:28px 12px;">

          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
            <tr>
              <td style="padding:0 4px 12px;">${wordmark()}</td>
            </tr>
            <tr>
              <td style="padding:0 4px 16px;">${status ? chip(status, tone) : ""}</td>
            </tr>

            <tr>
              <td class="sm-card" style="padding:32px;border:1px solid ${BRAND.line};border-radius:20px;background:${BRAND.card};">
                <h1 class="sm-title" style="margin:0 0 14px;font-family:${DISPLAY};font-size:26px;line-height:1.2;font-weight:700;color:${BRAND.ink};">${esc(
                  title,
                )}</h1>
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 6px 0;">
                ${
                  footerNote
                    ? `<p style="margin:0 0 10px;font-family:${FONT};font-size:13px;line-height:1.6;color:${BRAND.faint};">${esc(
                        footerNote,
                      )}</p>`
                    : ""
                }
                <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${BRAND.faint};">
                  Sent by Arvent. <a href="${esc(APP_URL)}" style="color:${BRAND.faint};text-decoration:underline;">arvent.app</a>
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`;
}
