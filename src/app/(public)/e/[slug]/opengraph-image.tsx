import { ImageResponse } from "next/og";

import { fmtTime } from "@/components/create-event/format";
import { fetchEventPreview } from "@/lib/seo/eventPreview";
import { passDate } from "@/lib/utils/pass";

/* The picture a shared invitation link shows in a chat.
 *
 * It is the invitation's own material — the host's poster if there is one, the
 * event's colours if the theme set any, the same day and venue line a guest
 * reads — at the 1200×630 size the social cards ask for. No guest, no counts,
 * no capacity: anything here was already on the public invitation.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
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

export default async function Image({
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

  const poster =
    typeof event.imageUrl === "string" && /^https?:\/\//.test(event.imageUrl)
      ? event.imageUrl
      : null;

  const colours = event.eventColors ?? {};
  const ground = poster ? INK : colour(colours.background, CREAM);
  const ink = poster ? "#ffffff" : colour(colours.text, INK);
  const accent = colour(colours.accent, "#dcf91c");

  const when = passDate(event.date);
  const time = event.programStartTime ? fmtTime(event.programStartTime) : "";
  const where = [event.venueName, event.location].filter(Boolean).join(", ");
  const facts = [when, time].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
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
              opacity: 0.85,
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: poster
              ? "linear-gradient(0deg, rgba(24,24,27,0.94) 0%, rgba(24,24,27,0.45) 55%, rgba(24,24,27,0.18) 100%)"
              : "transparent",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "56px 64px 0",
            color: ink,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            Arvent
          </div>
          {event.status === "cancelled" ? (
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "10px 20px",
                borderRadius: 999,
                border: `2px solid ${ink}`,
              }}
            >
              Cancelled
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0 64px",
            color: ink,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.75,
            }}
          >
            <div
              style={{
                width: 44,
                height: 8,
                borderRadius: 999,
                background: accent,
              }}
            />
            You’re invited
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: event.name.length > 34 ? 62 : 78,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            {clamp(event.name, 70)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 40,
            padding: "0 64px 60px",
            color: ink,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{facts}</div>
            {where ? (
              <div style={{ fontSize: 24, marginTop: 8, opacity: 0.8 }}>
                {clamp(where, 90)}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              borderRadius: 999,
              background: accent,
              color: INK,
              fontSize: 22,
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
