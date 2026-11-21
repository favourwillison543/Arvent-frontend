import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The body `POST /public/moments` receives.
 *
 * The deployed DTO whitelists its twelve fields and rejects anything else
 * (`400 property visibility should not exist`), so the editor's stray
 * `visibility` — left over from a PRD that no longer exists — made every card
 * fail with a validation error. This pins the body to exactly those fields.
 */
const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/lib/http/client", () => ({
  http: { post, get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { createPublicMoment } from "@/lib/api/moments";
import type { CreateMomentInput } from "@/lib/types/moment";

beforeEach(() => {
  post.mockReset();
  post.mockResolvedValue({ id: "moment-1" });
});

const input: CreateMomentInput = {
  kind: "save-the-date",
  style: "editorial",
  title: "Chika & Emeka",
  date: "2027-10-18",
  place: "Lagos",
  message: "",
  from: "",
  photo: "",
  themeId: "moment-save-date",
  fontId: "editorial",
  effectId: "glow",
  eventId: "",
};

describe("createPublicMoment", () => {
  it("POSTs to /public/moments", async () => {
    await createPublicMoment(input);

    expect(post).toHaveBeenCalledWith("/public/moments", expect.anything());
  });

  it("sends exactly the twelve DTO fields, whatever the caller holds", async () => {
    // A caller that still carries the retired field: it must not reach the wire.
    await createPublicMoment({ ...input, visibility: "public" } as CreateMomentInput);

    const body = post.mock.calls[0][1] as Record<string, unknown>;

    expect(Object.keys(body).sort()).toEqual(
      [
        "date",
        "effectId",
        "eventId",
        "fontId",
        "from",
        "kind",
        "message",
        "photo",
        "place",
        "style",
        "themeId",
        "title",
      ].sort(),
    );
    expect(body).not.toHaveProperty("visibility");
  });

  it("keeps an empty photo empty rather than dropping the field", async () => {
    await createPublicMoment(input);

    expect(post.mock.calls[0][1]).toMatchObject({ photo: "" });
  });
});
