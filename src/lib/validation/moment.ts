import { z } from "zod";

/**
 * The editor's own rules, mirroring the deployed `CreateMomentDto` so a mistake
 * is answered on the keystroke instead of by a 400:
 *
 *   kind/style   enum
 *   title        string, 1–60
 *   date         string, ≤40 (a `YYYY-MM-DD` from the date input, or "")
 *   place        string, ≤300
 *   message      string, ≤5000
 *   from         string, ≤140
 *   photo        http(s) URL or "" — never a `data:` URL
 *   theme/font/effectId  string, ≤64
 *   eventId      string, ≤64 (or "")
 *
 * There is no `visibility`: the contract does not have one.
 */
export const momentFormSchema = z.object({
  kind: z.enum(["save-the-date", "announcement", "milestone", "thank-you"]),
  style: z.enum(["editorial", "photo", "minimal"]),
  title: z.string().trim().min(1, "Add a title first.").max(60, "Keep the title under 60 characters."),
  date: z.string().max(40, "That date is too long."),
  place: z.string().max(300, "Keep the place under 300 characters."),
  message: z.string().max(5000, "Keep the note under 5,000 characters."),
  from: z.string().max(140, "Keep the name under 140 characters."),
  /**
   * Empty, an http(s) URL, or the browser's `data:` URL while the editor holds
   * the picked file. `useCreateMoment` uploads the `data:` one before sending;
   * nothing else ever leaves this bundle.
   */
  photo: z
    .string()
    .refine(
      (value) =>
        value === "" || /^https?:\/\//i.test(value) || value.startsWith("data:image/"),
      "Choose an image file.",
    ),
  themeId: z.string().max(60),
  fontId: z.string().max(60),
  effectId: z.string().max(60),
  eventId: z.string().max(64),
});

export type MomentFormValues = z.infer<typeof momentFormSchema>;

