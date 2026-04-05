import { PrismaClient, ModuleType, RunStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const classificationInput = {
    productName: "EcoSip Compostable Cup Lids",
    description: "Plant-fiber based lids for hot beverage cups in cafes and offices.",
    material: "Bagasse + PLA-free binding",
    useCase: "Cafe takeaway",
    brand: "EcoSip",
    sourceCountry: "India",
    packagingNotes: "Shipped in recycled carton"
  };

  const classificationOutput = {
    primaryCategory: "Packaging",
    subCategory: "Compostable Beverage Lids",
    seoTags: [
      "compostable cup lids",
      "plastic free takeaway",
      "bagasse lids",
      "sustainable cafe supplies",
      "eco beverage packaging"
    ],
    sustainabilityFilters: ["compostable", "plastic-free", "biodegradable", "recycled"],
    confidence: 0.91,
    reasoningNotes: "Material and use-case strongly align with compostable beverage packaging."
  };

  const proposalInput = {
    clientName: "GreenBite Catering",
    industry: "Food Service",
    clientGoals: "Reduce plastic usage in large corporate events and improve ESG communication.",
    budgetLimit: 5000,
    sustainabilityFocus: "plastic-free",
    preferredCategories: ["Packaging", "Cutlery"],
    quantityNeeds: "500 meal sets/week",
    notes: "Prefers local suppliers where possible"
  };

  const proposalOutput = {
    recommendedMix: [
      {
        productName: "Compostable Meal Trays",
        category: "Packaging",
        estimatedUnitCost: 12,
        recommendedQuantity: 220,
        estimatedTotal: 2640,
        reason: "Best fit for event volume and compostable compliance."
      },
      {
        productName: "Bamboo Cutlery Set",
        category: "Cutlery",
        estimatedUnitCost: 4,
        recommendedQuantity: 400,
        estimatedTotal: 1600,
        reason: "Plastic replacement with strong client-facing sustainability optics."
      }
    ],
    budgetSummary: {
      budgetLimit: 5000,
      allocatedBudget: 4240,
      remainingBudget: 760
    },
    costBreakdown: {
      productsTotal: 4240,
      estimatedShipping: 250,
      grandTotal: 4490
    },
    impactPositioningSummary:
      "This mix replaces high-visibility single-use plastics while staying under budget and supporting measurable sustainability messaging for enterprise clients."
  };

  await prisma.productClassificationRun.create({
    data: {
      productName: classificationInput.productName,
      inputJson: classificationInput,
      prompt: "Seeded prompt for module 1",
      rawAiResponse: JSON.stringify(classificationOutput),
      parsedOutputJson: classificationOutput,
      status: RunStatus.SUCCESS
    }
  });

  await prisma.proposalRun.create({
    data: {
      clientName: proposalInput.clientName,
      industry: proposalInput.industry,
      budgetLimit: proposalInput.budgetLimit,
      inputJson: proposalInput,
      prompt: "Seeded prompt for module 2",
      rawAiResponse: JSON.stringify(proposalOutput),
      parsedOutputJson: proposalOutput,
      status: RunStatus.SUCCESS
    }
  });

  await prisma.aiLog.createMany({
    data: [
      {
        moduleType: ModuleType.MODULE_1,
        prompt: "Seeded prompt for module 1",
        rawResponse: JSON.stringify(classificationOutput),
        parsedResponseJson: classificationOutput,
        success: true
      },
      {
        moduleType: ModuleType.MODULE_2,
        prompt: "Seeded prompt for module 2",
        rawResponse: JSON.stringify(proposalOutput),
        parsedResponseJson: proposalOutput,
        success: true
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
