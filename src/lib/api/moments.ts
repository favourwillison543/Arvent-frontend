import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/http/client";
import type { CreateMomentInput, Moment } from "@/lib/types/moment";
import { asPage } from "@/lib/utils/list";

export type GetMomentsParams = {
  /** One kind at a time - the wall's filter chips. */
  kind?: string;
  /** The wall is capped rather than paged; the teaser asks for a few. */
  limit?: number;
};

/** `GET /moments` is the shared wall: public cards only, newest first. */
export async function getMoments(params?: GetMomentsParams) {
  const searchParams = new URLSearchParams();

  if (params?.kind) {
    searchParams.set("kind", params.kind);
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  const path = `${endpoints.moments.list}${query ? `?${query}` : ""}`;

  // A cursor page like every other list: `{ items, nextCursor }`.
  return asPage<Moment>(await http.get<unknown>(path), `GET ${path}`);
}

export function getPublicMoment(id: string) {
  return http.get<Moment>(endpoints.public.moment(id));
}

/**
 * The twelve fields of `CreateMomentDto`, named one by one.
 *
 * A spread would forward whatever the caller happens to hold, and the DTO
 * whitelist answers an unknown key with `400 property x should not exist` —
 * which is exactly how the editor once failed (`visibility`). Naming the fields
 * makes an extra key impossible to send.
 */
function toCreateMomentBody(input: CreateMomentInput): CreateMomentInput {
  return {
    kind: input.kind,
    style: input.style,
    title: input.title,
    date: input.date,
    place: input.place,
    message: input.message,
    from: input.from,
    photo: input.photo,
    themeId: input.themeId,
    fontId: input.fontId,
    effectId: input.effectId,
    eventId: input.eventId,
  };
}

export function createPublicMoment(input: CreateMomentInput) {
  return http.post<Moment>(endpoints.moments.create, toCreateMomentBody(input));
}

