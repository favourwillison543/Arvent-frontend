import { ImageResponse } from "next/og";
import sharp from "sharp";

import { fetchEventPreview } from "@/lib/seo/eventPreview";

/* The picture a shared invitation link shows in a chat.
 *
 * Deliberately simple: the host's poster, the event name and an RSVP button.
 * The date, venue and everything else wait on the invitation itself, which
 * opens when the link is tapped. 1200×630, the size social cards ask for.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";
export const alt = "An invitation on Arvent";

const CREAM = "#f2efe6";
const INK = "#18181b";

/** Only a real colour string is safe to hand to the renderer. */
function colour(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value)
    ? value
    : fallback;
}

function clamp(text: string, limit: number) {
  const flat = text.replace(/\s+/g, " ").trim();

  return flat.length <= limit ? flat : `${flat.slice(0, limit - 1).trimEnd()}…`;
}

/**
 * Load the poster ourselves so a slow, missing or unsupported image (WebP,
 * AVIF) falls back to the plain card instead of breaking the whole preview.
 */
async function safePoster(url: unknown) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) return null;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get("content-type") ?? "";

    if (!res.ok || !/image\/(png|jpe?g|gif)/.test(type)) return null;

    const bytes = Buffer.from(await res.arrayBuffer()).toString("base64");

    return `data:${type.split(";")[0]};base64,${bytes}`;
  } catch {
    return null;
  }
}

/* WhatsApp drops the picture from a link preview when the file is heavy (about
 * 300 KB is the usual ceiling), and a photo card saved as PNG easily passes
 * 1 MB. So the card is drawn as before, then squeezed to a JPEG under the limit.
 */
const MAX_BYTES = 250 * 1024;
const QUALITIES = [80, 68, 55];

// Events can be edited, so the card is cached for an hour, not for a year.
const CACHE = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

async function toJpeg(card: ImageResponse) {
  const png = Buffer.from(await card.arrayBuffer());

  try {
    for (const quality of QUALITIES) {
      const jpeg = await sharp(png)
        .flatten({ background: INK })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      if (jpeg.length <= MAX_BYTES || quality === QUALITIES[QUALITIES.length - 1]) {
        return new Response(new Uint8Array(jpeg), {
          headers: { "Content-Type": "image/jpeg", "Cache-Control": CACHE },
        });
      }
    }
  } catch {
    // Compression failed: a heavy card still beats no card.
  }

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": CACHE },
  });
}

export default async function Image(props: {
  params: Promise<{ slug: string }>;
}) {
  return toJpeg(await render(props));
}

/** Everything the card draws; `Image` above turns it into a small JPEG. */
async function render({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchEventPreview(slug);

  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: CREAM,
            color: INK,
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          Arvent
        </div>
      ),
      size,
    );
  }

  const poster = await safePoster(event.imageUrl);

  const colours = event.eventColors ?? {};
  const ground = poster ? INK : colour(colours.background, CREAM);
  const ink = poster ? "#ffffff" : colour(colours.text, INK);
  const accent = colour(colours.accent, "#dcf91c");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          background: ground,
          position: "relative",
        }}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        {/* A soft fade at the bottom so the title reads over any poster. */}
        {poster ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(0deg, rgba(24,24,27,0.85) 0%, rgba(24,24,27,0.35) 40%, rgba(24,24,27,0) 70%)",
            }}
          />
        ) : null}

        {event.status === "cancelled" ? (
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 64,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "10px 20px",
              borderRadius: 999,
              border: `2px solid ${ink}`,
              color: ink,
            }}
          >
            Cancelled
          </div>
        ) : null}

        {/* Bottom padding keeps the title clear of X's own title badge. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 40,
            padding: "0 64px 96px",
            color: ink,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: event.name.length > 34 ? 62 : 78,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: -1.5,
              maxWidth: 840,
            }}
          >
            {clamp(event.name, 70)}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 30px",
              borderRadius: 999,
              background: accent,
              color: INK,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            RSVP
          </div>
        </div>
      </div>
    ),
    size,
  );
}