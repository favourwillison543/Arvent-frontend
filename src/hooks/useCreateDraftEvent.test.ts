import { describe, expect, it } from "vitest";

import { defaultDraft } from "@/components/create-event/draft";
import { toCreateEventInput } from "@/hooks/useCreateDraftEvent";

/**
 * The draft → `CreateEventInput` translation is the one place the app's words
 * become the contract's. It was rewritten once to an older vocabulary
 * (`title`/`eventType`/`startAt`/`location`), and every create then failed with
 * a 400 — the DTO whitelist rejects unknown keys instead of ignoring them.
 *
 * These assertions pin the PRD v2.2 names.
 */
const draft = {
  ...defaultDraft,
  title: "Ada's 30th",
  eventType: "birthday" as const,
  date: "2026-12-24",
  startTime: "18:00",
  venue: "Eko Hotel",
  address: "Plot 1415 Adetokunbo Ademola St",
  capacity: "40",
  plusOnes: 2,
};

describe("toCreateEventInput", () => {
  it("speaks the contract, not the draft", () => {
    const input = toCreateEventInput(draft);

    expect(input).toMatchObject({
      name: "Ada's 30th",
      type: "birthday",
      date: "2026-12-24",
      programStartTime: "18:00",
      venueName: "Eko Hotel",
      location: "Plot 1415 Adetokunbo Ademola St",
      visibility: "public",
      rsvpAccess: "open",
      capacity: 40,
      maxAdditionalGuests: 2,
    });

    expect(input).not.toHaveProperty("title");
    expect(input).not.toHaveProperty("eventType");
    expect(input).not.toHaveProperty("startAt");
    expect(input).not.toHaveProperty("locationAddress");
    expect(input).not.toHaveProperty("coverImage");
  });

  it("uses the venue as the location when no street address was given", () => {
    expect(toCreateEventInput({ ...draft, address: "" })).toMatchObject({
      venueName: "Eko Hotel",
      location: "Eko Hotel",
    });
  });

  it("keeps the invitation design in eventColors, verbatim", () => {
    expect(toCreateEventInput(draft).eventColors).toMatchObject({
      themeId: draft.themeId,
      posterId: draft.posterId,
      fontId: draft.fontId,
      effectId: draft.effectId,
      rsvpStyleId: draft.rsvpStyleId,
      rsvpMode: draft.rsvpMode,
      rsvpGoing: draft.rsvpGoing,
      rsvpMaybe: draft.rsvpMaybe,
      rsvpNo: draft.rsvpNo,
    });
  });

  it("omits memory settings the host never chose", () => {
    const input = toCreateEventInput(draft);

    expect(input).not.toHaveProperty("memoriesEnabled");
    expect(input).not.toHaveProperty("memoriesAccess");
  });

  it("sends imageUrl — a URL, never the browser's data: URL", () => {
    const withPoster = {
      ...draft,
      image: "data:image/png;base64,AAAA",
    };

    expect(toCreateEventInput(withPoster)).not.toHaveProperty("imageUrl");
    expect(
      toCreateEventInput(withPoster, "https://cdn.example.com/p.jpg"),
    ).toMatchObject({ imageUrl: "https://cdn.example.com/p.jpg" });
  });

  it("asks for approval only when the host required it", () => {
    expect(
      toCreateEventInput({ ...draft, requireApproval: true }).rsvpAccess,
    ).toBe("request");
  });
});
