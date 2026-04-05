import type { Module1BusinessOutput } from "@/lib/validators/module1";
import type { Module2BusinessOutput } from "@/lib/validators/module2";

export const module1FallbackOutput: Module1BusinessOutput = {
  primaryCategory: "Miscellaneous",
  subCategory: "General Sustainable Product",
  seoTags: [
    "sustainable product",
    "eco-friendly alternative",
    "green procurement",
    "b2b sustainable sourcing",
    "responsible supply chain"
  ],
  sustainabilityFilters: ["reusable"],
  confidence: 0.62,
  reasoningNotes: "Fallback classification used when AI output is unavailable or malformed."
};

export const module2FallbackOutput: Module2BusinessOutput = {
  recommendedMix: [
    {
      productName: "Starter Sustainable Supply Bundle",
      category: "Miscellaneous",
      estimatedUnitCost: 100,
      recommendedQuantity: 1,
      estimatedTotal: 100,
      reason: "Fallback line item used when AI proposal generation fails."
    }
  ],
  budgetSummary: {
    budgetLimit: 100,
    allocatedBudget: 100,
    remainingBudget: 0
  },
  costBreakdown: {
    productsTotal: 100,
    estimatedShipping: 0,
    grandTotal: 100
  },
  impactPositioningSummary:
    "Fallback proposal emphasizes immediate replacement of high-visibility disposable items while preserving budget control."
};
