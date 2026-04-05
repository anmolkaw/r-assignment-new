export const PRIMARY_CATEGORIES = [
  "Packaging",
  "Cutlery",
  "Tableware",
  "Bags",
  "Office Supplies",
  "Hospitality Supplies",
  "Personal Care",
  "Cleaning",
  "Food Service",
  "Miscellaneous"
] as const;

export const SUSTAINABILITY_FILTERS = [
  "plastic-free",
  "compostable",
  "vegan",
  "recycled",
  "reusable",
  "biodegradable",
  "local-sourcing"
] as const;

export const MODULE_1_SAMPLE_INPUT = {
  productName: "EcoSip Compostable Cup Lids",
  description: "Plant-fiber based lids for hot beverage cups in cafes and offices.",
  material: "Bagasse",
  useCase: "Cafe takeaway",
  brand: "EcoSip",
  sourceCountry: "India",
  packagingNotes: "Packed in recycled kraft carton"
};

export const MODULE_2_SAMPLE_INPUT = {
  clientName: "GreenBite Catering",
  industry: "Food Service",
  clientGoals: "Replace single-use plastic disposables for enterprise catering events.",
  budgetLimit: 5000,
  sustainabilityFocus: "plastic-free, compostable",
  preferredCategories: ["Packaging", "Cutlery"],
  quantityNeeds: "500 meal sets/week",
  notes: "Needs good sustainability messaging for procurement deck"
};
