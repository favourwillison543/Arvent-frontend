import type { Metadata } from "next";

import { InvitationPage } from "@/components/invitation/InvitationPage";
import InvitationFrame from "@/components/invitation/InvitationFrame";
import { fetchEventPreview } from "@/lib/seo/eventPreview";
import { sitePath } from "@/lib/site";
import { passDate } from "@/lib/utils/pass";

/**
 * A public page: the invitation is the guest's, and the frame around it is the
 * same one the rest of the site wears. `HomeSidebar` decides for itself whether
 * to draw the guest's Log in block or the signed-in organizer's account.
 */
export default function Page() {
  return (
    <InvitationFrame>
      <InvitationPage />
    </InvitationFrame>
  );
}

/** Long descriptions are for the page; a share card gets one sentence. */
function excerpt(text: string, limit = 160) {
  const flat = text.replace(/\s+/g, " ").trim();

  return flat.length <= limit ? flat : `${flat.slice(0, limit - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventPreview(slug);

  // An invitation that cannot be read is still an invitation: the page draws its
  // own "unavailable" state, so the metadata says only what it knows.
  if (!event) {
    return {
      title: { absolute: "Invitation | Arvent" },
      robots: { index: false, follow: false },
    };
  }

  const url = sitePath(`/e/${event.slug}`);
  const when = passDate(event.date);
  const where = [event.venueName, event.location].filter(Boolean).join(", ");

  const description =
    [when, where].filter(Boolean).join(" · ") +
    (event.description ? ` — ${excerpt(event.description)}` : "");

  // A private invitation is shareable but not findable. The tags are the same
  // for both: the share card is exactly what the host sends.
  const indexable =
    event.visibility === "public" && event.status === "published";

  return {
    title: { absolute: `${event.name} | Arvent` },
    description,
    alternates: { canonical: url },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    // `og:image` / `twitter:image` are deliberately not set here: the
    // `opengraph-image.tsx` file next to this page supplies them. Next hashes the
    // image route (`/e/<slug>/opengraph-image-<build hash>?<hash>`) so a card is
    // re-fetched when the poster or the renderer changes, and a hand-built
    // `/e/<slug>/opengraph-image` URL answers 404 — no card, just a bare link.
    openGraph: {
      type: "website",
      url,
      siteName: "Arvent",
      title: event.name,
      description,
      locale: "en",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description,
    },
  };
}
