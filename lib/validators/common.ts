import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1)
});

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}
