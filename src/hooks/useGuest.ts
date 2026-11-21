"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  claimGuestSession,
  claimGuestPass,
  getGuest,
  getGuestPass,
  getPublicEvent,
  passSession,
  reconfirmGuest,
  submitRsvp,
  updateGuestRsvp,
} from "@/lib/api/public";
import type { GuestPassAnswer, GuestSession } from "@/lib/api/public";
import type {
  Guest,
  RsvpResponse,
  SubmitRsvpInput,
  UpdateRsvpInput,
} from "@/lib/types/guest";
import { rememberGuestSlug, rememberedGuestSlug } from "@/lib/utils/guestSlug";

export type { GuestSession };

/** A pass link carries an `agp_…` token; everything else is a guest access code. */
function isPassToken(token: string) {
  return token.startsWith("agp_");
}

/** The event a pass claim already named, if it named one. */
function claimedSlug(answer: unknown): string | undefined {
  if (!answer || typeof answer !== "object") return undefined;

  const pass = (answer as { pass?: { event?: { slug?: string } } }).pass;

  return pass?.event?.slug;
}

/**
 * The guest behind the link.
 *
 * Guest identity is an httpOnly cookie in the v2.2 contract, so the code in the
 * URL is **exchanged once** (`POST /public/guest/session`, or
 * `/public/guest/pass/session` for an `agp_…` pass) and never sent again; the
 * reads after it ride the cookie, with `X-Event-Slug` picking the event.
 *
 * That header is not optional. The cookie is named after the event
 * (`arvent_g_<slug>`), so a read that does not name an event cannot tell which
 * cookie it is being asked about, and the API answers `401 INVALID_TOKEN` even
 * when the cookie is present — verified against the live API: same cookie, 401
 * without the header, 200 with it. The slug is therefore resolved from the
 * address (`?e=`), from the claim's own answer, or from the event this device
 * last replied to (`lib/utils/guestSlug.ts`).
 *
 * `options.pass` asks for the pass read even when the token is an ordinary guest
 * token: `/pass/<token>` is the guest's own page, and the pass endpoint is the
 * one that answers it without the guest having to name the event. Both reads
 * fall back to `GET /public/guest` so an older deployment still opens the pass.
 */
export function useGuest(
  guestToken?: string,
  slug?: string,
  options: { pass?: boolean } = {},
) {
  const queryClient = useQueryClient();
  const claimByPass = !!guestToken && isPassToken(guestToken);
  const pass = options.pass ?? claimByPass;

  const claim = useMutation<GuestPassAnswer | { guest?: Guest }, unknown, string>({
    mutationFn: (token: string) =>
      isPassToken(token) ? claimGuestPass(token) : claimGuestSession(token),
  });

  const { mutate: claimToken } = claim;

  useEffect(() => {
    if (guestToken) claimToken(guestToken);
  }, [guestToken, claimToken]);

  // The address first, then what the claim itself answered, then the event this
  // device last replied to. A guest who opens `/pass#token=…` from an email has
  // only the third.
  const eventSlug = slug || claimedSlug(claim.data) || rememberedGuestSlug();

  // A claim can name the event the address did not (`{ pass: { event } }`); keep
  // it for the pass the guest opens next, which carries no event of its own.
  useEffect(() => {
    if (eventSlug) rememberGuestSlug(eventSlug);
  }, [eventSlug]);

  const queryKey = ["guest", guestToken ?? "cookie", eventSlug ?? ""] as const;

  /**
   * What the claim already answered.
   *
   * `POST /public/guest/pass/session` returns the whole pass and its event
   * (`{ pass: { guest, event, reference }, passUrl }`), so reading it back is a
   * second question with the same answer — and the read is the part that can
   * fail. `POST /public/guest/session` returns the guest alone, so it still needs
   * the event from the address to become a session.
   */
  const claimedSession = async (): Promise<GuestSession | null> => {
    const answer = claim.data as GuestPassAnswer | { guest?: Guest } | undefined;

    if (!answer) return null;

    if ("pass" in answer && answer.pass) return passSession(answer);

    const guest = (answer as { guest?: Guest }).guest;

    if (!guest || !eventSlug) return null;

    try {
      return {
        guest,
        event: await getPublicEvent(eventSlug),
        reference: guest.passReference,
      };
    } catch {
      return null;
    }
  };

  const guestQuery = useQuery<GuestSession>({
    queryKey,
    queryFn: async () => {
      if (!pass) return getGuest(eventSlug);

      // `/pass/<token>` reads the pass; a deployment that has not shipped that
      // route still answers the guest, so the pass page is never a dead end.
      try {
        return passSession(await getGuestPass(eventSlug));
      } catch (passError) {
        try {
          return await getGuest(eventSlug);
        } catch {
          // Both reads refused. The claim's own answer is still the guest's
          // record, so the pass opens instead of blaming the link.
          const claimed = await claimedSession();
          if (claimed) return claimed;

          throw passError;
        }
      }
    },
    enabled: !!guestToken && claim.isSuccess,
  });

  const rsvpMutation = useMutation({
    mutationFn: ({
      slug: rsvpSlug,
      data,
    }: {
      slug: string;
      data: SubmitRsvpInput;
    }) => submitRsvp(rsvpSlug, data),

    onSuccess: (response: RsvpResponse) => {
      queryClient.setQueryData(queryKey, (current: unknown) => {
        if (!current || typeof current !== "object") return current;

        return { ...(current as object), guest: response.guest };
      });
    },
  });

  const updateRsvpMutation = useMutation({
    mutationFn: (data: UpdateRsvpInput) => {
      if (!guestToken) {
        throw new Error("Guest token is required");
      }

      return updateGuestRsvp(data, eventSlug);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const reconfirmMutation = useMutation({
    /**
     * Both answers the product offers — "still coming" and "still coming, with
     * a change" — are `attending: true` on the wire; declining is an RSVP
     * change, not a reconfirmation.
     */
    mutationFn: (response: "confirmed" | "changed") =>
      reconfirmGuest(
        response === "confirmed" || response === "changed",
        eventSlug,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    guest: guestQuery.data?.guest,
    event: guestQuery.data?.event,
    /** The code the pass prints (`MHAM-NX81`), when the API sent one. */
    reference: guestQuery.data?.reference,

    isLoading: claim.isPending || guestQuery.isLoading,
    error: claim.error ?? guestQuery.error,

    submitRsvp: rsvpMutation.mutateAsync,
    updateRsvp: updateRsvpMutation.mutateAsync,
    reconfirm: reconfirmMutation.mutateAsync,

    isSubmittingRsvp: rsvpMutation.isPending,
    isUpdatingRsvp: updateRsvpMutation.isPending,
    isReconfirming: reconfirmMutation.isPending,
  };
}
