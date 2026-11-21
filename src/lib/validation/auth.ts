import { z } from "zod";
import { requiredEmailSchema } from "./forms";

/**
 * Mirrors `RegisterDto` from the API's own OpenAPI document, which is what the
 * deployed service validates against:
 *
 *   name     string, 1–120
 *   email    email, ≤254
 *   phone    string, 5–32   ← the form's field; `AuthForm` sends `phoneNumber`
 *   password string, 10–128
 *
 * The bounds are repeated here so a typo is answered on the keystroke instead
 * of by a round trip that comes back as `VALIDATION_FAILED` with
 * class-validator's own wording ("password must be a string").
 */
export const authSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  email: requiredEmailSchema.max(254),
  phone: z
    .string()
    .trim()
    .min(5, "Enter your phone number.")
    .max(32, "That phone number is too long."),
  password: z
    .string()
    .min(10, "Use at least 10 characters.")
    .max(128, "Use no more than 128 characters."),
});

/**
 * Login only checks that something was typed. Revealing the password policy on
 * the sign-in form would hand an attacker the shaping rules for free.
 */
export const loginSchema = z.object({
  name: z.string().optional().default(""),
  email: requiredEmailSchema,
  phone: z.string().optional().default(""),
  password: z.string().min(1, "Enter your password."),
});

export type AuthValues = z.infer<typeof authSchema>;
