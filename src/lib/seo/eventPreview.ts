/* What a crawler is allowed to know about an invitation.
 *
 * This is a server-side read of the public event endpoint, used only for
 * `<meta>` tags and the share image. It returns the fields that are already on
 * the invitation itself — name, day, place, description, poster — and nothing
 * else: no guest counts, no capacity, no host contact. If the API is down or
 * answers a page instead of JSON, the caller gets `null` and the invitation
 * still renders; the preview is the only thing that degrades.
 */

import { apiOrigin } from "@/lib/config/api";
import type { Event } from "@/lib/types/event";


export type EventPreview = Pick<
  Event,
  | "name"
  | "slug"
  | "description"
  | "imageUrl"
  | "date"
  | "programStartTime"
  | "doorsOpenTime"
  | "venueName"
  | "location"
  | "status"
  | "visibility"
  | "type"
  | "eventColors"
>;

const API_URL = apiOrigin();

export async function fetchEventPreview(
  slug: string,
): Promise<EventPreview | null> {
  if (!API_URL) return null;

  try {
    const response = await fetch(
      `${API_URL}/public/events/${encodeURIComponent(slug)}`,
      {
        headers: { accept: "application/json" },
        // A shared link should keep its poster for a few minutes without a
        // fresh read; a host's edit shows up within five.
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as EventPreview;

    // A wrong base URL answers with the app's HTML, which parses to nothing.
    if (!data || typeof data.name !== "string" || !data.name.trim()) return null;

    return data;
  } catch {
    return null;
  }
}
