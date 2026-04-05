import { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } from "@/lib/constants";
import {
  module1BusinessOutputSchema,
  type Module1AiOutput,
  type Module1BusinessOutput,
  type Module1Request
} from "@/lib/validators/module1";

const categoryMap: Record<string, (typeof PRIMARY_CATEGORIES)[number]> = {
  packaging: "Packaging",
  pack: "Packaging",
  cutlery: "Cutlery",
  utensil: "Cutlery",
  tableware: "Tableware",
  plate: "Tableware",
  bag: "Bags",
  office: "Office Supplies",
  hospitality: "Hospitality Supplies",
  hotel: "Hospitality Supplies",
  personal: "Personal Care",
  cleaning: "Cleaning",
  food: "Food Service",
  service: "Food Service"
};

const sustainabilitySynonyms: Record<string, (typeof SUSTAINABILITY_FILTERS)[number]> = {
  "plastic free": "plastic-free",
  plasticfree: "plastic-free",
  compost: "compostable",
  vegan: "vegan",
  recycled: "recycled",
  recyclable: "recycled",
  reusable: "reusable",
  biodegrade: "biodegradable",
  biodegradable: "biodegradable",
  local: "local-sourcing",
  "local sourcing": "local-sourcing"
};

function normalizeCategory(value: string): (typeof PRIMARY_CATEGORIES)[number] {
  const normalized = value.trim().toLowerCase();

  const exact = PRIMARY_CATEGORIES.find((category) => category.toLowerCase() === normalized);
  if (exact) {
    return exact;
  }

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }

  return "Miscellaneous";
}

function normalizeSustainabilityFilters(values: string[]): (typeof SUSTAINABILITY_FILTERS)[number][] {
  const deduped: (typeof SUSTAINABILITY_FILTERS)[number][] = [];

  values.forEach((value) => {
    const normalized = value.trim().toLowerCase();

    const exact = SUSTAINABILITY_FILTERS.find((filter) => filter === normalized);
    if (exact && !deduped.includes(exact)) {
      deduped.push(exact);
      return;
    }

    for (const [keyword, mapped] of Object.entries(sustainabilitySynonyms)) {
      if (normalized.includes(keyword) && !deduped.includes(mapped)) {
        deduped.push(mapped);
        return;
      }
    }
  });

  if (deduped.length === 0) {
    deduped.push("reusable");
  }

  return deduped;
}

function normalizeSeoTags(input: Module1Request, tags: string[]): string[] {
  const normalized = Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 1)
        .map((tag) => tag.replace(/\s+/g, " "))
    )
  );

  const fallback = [
    `${input.productName} sustainable`,
    `${input.material} eco friendly`,
    `${input.useCase} green solution`,
    "sustainable product",
    "eco procurement",
    "esg sourcing"
  ]
    .map((tag) => tag.toLowerCase())
    .filter(Boolean);

  for (const fallbackTag of fallback) {
    if (!normalized.includes(fallbackTag)) {
      normalized.push(fallbackTag);
    }
  }

  return normalized.slice(0, 10);
}

export function applyModule1BusinessRules(
  input: Module1Request,
  aiOutput: Module1AiOutput
): Module1BusinessOutput {
  const seoTags = normalizeSeoTags(input, aiOutput.seoTags);

  if (seoTags.length < 5) {
    const additional = [
      `${input.productName.toLowerCase()} eco`,
      `${normalizeCategory(aiOutput.primaryCategory).toLowerCase()} supplier`,
      "sustainable b2b"
    ];

    for (const tag of additional) {
      if (!seoTags.includes(tag)) {
        seoTags.push(tag);
      }
      if (seoTags.length >= 5) {
        break;
      }
    }
  }

  const output: Module1BusinessOutput = {
    primaryCategory: normalizeCategory(aiOutput.primaryCategory),
    subCategory: aiOutput.subCategory.trim() || "General Sustainable Product",
    seoTags: seoTags.slice(0, 10),
    sustainabilityFilters: normalizeSustainabilityFilters(aiOutput.sustainabilityFilters),
    confidence: Math.max(0, Math.min(1, aiOutput.confidence ?? 0.75)),
    reasoningNotes: aiOutput.reasoningNotes?.trim() || undefined
  };

  return module1BusinessOutputSchema.parse(output);
}
