import { z } from "zod";

export const module2RequestSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(2).max(120),
  clientGoals: z.string().trim().min(10).max(2000),
  budgetLimit: z
    .number({ invalid_type_error: "Budget limit must be a number" })
    .positive("Budget must be greater than zero")
    .max(1_000_000),
  sustainabilityFocus: z.string().trim().max(300).optional().or(z.literal("")),
  preferredCategories: z.array(z.string().trim().min(1)).max(20).optional(),
  quantityNeeds: z.string().trim().max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal(""))
});

export type Module2Request = z.infer<typeof module2RequestSchema>;

export const proposalItemSchema = z.object({
  productName: z.string().min(2),
  category: z.string().min(2),
  estimatedUnitCost: z.number().nonnegative(),
  recommendedQuantity: z.number().int().nonnegative(),
  estimatedTotal: z.number().nonnegative(),
  reason: z.string().min(4)
});

export const module2AiOutputSchema = z.object({
  recommendedMix: z.array(proposalItemSchema).min(1).max(10),
  budgetSummary: z.object({
    budgetLimit: z.number().positive(),
    allocatedBudget: z.number().nonnegative(),
    remainingBudget: z.number()
  }),
  costBreakdown: z.object({
    productsTotal: z.number().nonnegative(),
    estimatedShipping: z.number().nonnegative(),
    grandTotal: z.number().nonnegative()
  }),
  impactPositioningSummary: z.string().min(20).max(1200)
});

export type Module2AiOutput = z.infer<typeof module2AiOutputSchema>;

export const module2BusinessOutputSchema = module2AiOutputSchema;
export type Module2BusinessOutput = z.infer<typeof module2BusinessOutputSchema>;
