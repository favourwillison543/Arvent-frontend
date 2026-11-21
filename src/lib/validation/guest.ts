import { z } from "zod";
import { guestNameSchema, optionalEmailSchema, requiredTextSchema } from "./forms";

/**
 * A guest answering an invitation must leave the host one way to reach them: an
 * email address or a phone number - one of the two, both is fine.
 *
 * This is the single implementation of the rule. The themed RSVP form on the
 * invitation page is hand-rolled and calls it directly; `createRsvpSchema` calls
 * it through a zod refinement. The API has to enforce the same rule, because a
 * client is never a trust boundary.
 */
export function validateGuestContact(contact: {
  email?: string | null;
  phone?: string | null;
}): string | null {
  const email = contact.email?.trim() ?? "";
  const phone = contact.phone?.trim() ?? "";

  return email || phone
    ? null
    : "Add an email address or a phone number so the host can reach you about your RSVP.";
}

export const addGuestSchema = z.object({
  name: requiredTextSchema("Enter the guest’s name.", 120),
  email: optionalEmailSchema,
  phone: z.string().max(30),
  seatLimit: z.number().int().min(1).max(50),
});

export const guestImportSchema = z.object({
  raw: z.string().trim().min(1, "Paste at least one guest."),
});

export function createRsvpSchema(maxAdditionalGuests: number) {
  return z
    .object({
      name: guestNameSchema,
      email: optionalEmailSchema,
      phone: z.string().max(30),
      rsvpStatus: z.enum(["going", "maybe", "not_going"]),
      additionalGuestCount: z.number().int().min(0).max(maxAdditionalGuests),
      consent: z.boolean().refine(Boolean, "Consent is required to submit your RSVP."),
    })
    // Mirrored on the `phone` field so react-hook-form can render it next to an
    // input; the message names both fields, so either one clears it.
    .refine((values) => validateGuestContact(values) === null, {
      message:
        "Add an email address or a phone number so the host can reach you about your RSVP.",
      path: ["phone"],
    });
}

export type AddGuestValues = z.infer<typeof addGuestSchema>;
export type GuestImportValues = z.infer<typeof guestImportSchema>;
export type RsvpFormValues = z.infer<ReturnType<typeof createRsvpSchema>>;
