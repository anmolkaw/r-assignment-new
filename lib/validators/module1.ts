import { z } from "zod";
import { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } from "@/lib/constants";

export const module1RequestSchema = z.object({
  productName: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  material: z.string().trim().min(2).max(200),
  useCase: z.string().trim().min(2).max(500),
  brand: z.string().trim().max(120).optional().or(z.literal("")),
  sourceCountry: z.string().trim().max(120).optional().or(z.literal("")),
  packagingNotes: z.string().trim().max(500).optional().or(z.literal(""))
});

export type Module1Request = z.infer<typeof module1RequestSchema>;

export const module1AiOutputSchema = z.object({
  primaryCategory: z.string(),
  subCategory: z.string().min(2),
  seoTags: z.array(z.string().min(2)).min(1).max(20),
  sustainabilityFilters: z.array(z.string().min(2)).max(10),
  confidence: z.number().min(0).max(1).optional(),
  reasoningNotes: z.string().max(500).optional()
});

export type Module1AiOutput = z.infer<typeof module1AiOutputSchema>;

export const module1BusinessOutputSchema = z.object({
  primaryCategory: z.enum(PRIMARY_CATEGORIES),
  subCategory: z.string().min(2),
  seoTags: z.array(z.string().min(2)).min(5).max(10),
  sustainabilityFilters: z.array(z.enum(SUSTAINABILITY_FILTERS)).min(1),
  confidence: z.number().min(0).max(1),
  reasoningNotes: z.string().max(500).optional()
});

export type Module1BusinessOutput = z.infer<typeof module1BusinessOutputSchema>;
