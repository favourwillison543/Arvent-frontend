import { z } from "zod";
import { requiredTextSchema } from "./forms";

export const updateSchema = z.object({
  title: requiredTextSchema("Enter a title.", 100),
  message: requiredTextSchema("Enter a message.", 3000),
});

export type UpdateValues = z.infer<typeof updateSchema>;
