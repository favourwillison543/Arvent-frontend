import { z } from "zod";

export const requiredEmailSchema = z.string().trim().email("Enter a valid email address.");
export const optionalEmailSchema = z.union([z.literal(""), requiredEmailSchema]);

export const guestNameSchema = z.string().trim().min(1, "Enter your name.").max(120);

export function requiredTextSchema(message: string, maxLength: number) {
  return z.string().trim().min(1, message).max(maxLength);
}
