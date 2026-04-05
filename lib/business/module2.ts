import {
  module2BusinessOutputSchema,
  type Module2AiOutput,
  type Module2BusinessOutput,
  type Module2Request
} from "@/lib/validators/module2";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeItem(item: Module2AiOutput["recommendedMix"][number]) {
  const unitCost = round2(Math.max(0, item.estimatedUnitCost));
  const recommendedQuantity = Math.max(0, Math.floor(item.recommendedQuantity));
  const estimatedTotal = round2(unitCost * recommendedQuantity);

  return {
    ...item,
    estimatedUnitCost: unitCost,
    recommendedQuantity,
    estimatedTotal,
    reason: item.reason.trim()
  };
}

function rebalanceToBudget(
  items: ReturnType<typeof normalizeItem>[],
  budgetLimit: number
): ReturnType<typeof normalizeItem>[] {
  let working = items
    .filter((item) => item.recommendedQuantity > 0)
    .map((item) => ({ ...item }));

  const total = () => round2(working.reduce((sum, item) => sum + item.estimatedTotal, 0));

  if (total() <= budgetLimit) {
    return working;
  }

  const ratio = budgetLimit / Math.max(total(), 1);

  working = working
    .map((item) => {
      const adjustedQuantity = Math.floor(item.recommendedQuantity * ratio);
      return {
        ...item,
        recommendedQuantity: adjustedQuantity,
        estimatedTotal: round2(adjustedQuantity * item.estimatedUnitCost)
      };
    })
    .filter((item) => item.recommendedQuantity > 0);

  let safety = 0;
  while (total() > budgetLimit && working.length > 0 && safety < 500) {
    safety += 1;
    const expensiveIndex = working.findIndex(
      (candidate) =>
        candidate.estimatedTotal ===
        Math.max(...working.map((item) => (item.recommendedQuantity > 0 ? item.estimatedTotal : 0)))
    );

    if (expensiveIndex === -1) {
      break;
    }

    if (working[expensiveIndex].recommendedQuantity > 1) {
      working[expensiveIndex].recommendedQuantity -= 1;
      working[expensiveIndex].estimatedTotal = round2(
        working[expensiveIndex].recommendedQuantity * working[expensiveIndex].estimatedUnitCost
      );
    } else {
      working.splice(expensiveIndex, 1);
    }
  }

  return working;
}

export function applyModule2BusinessRules(
  input: Module2Request,
  aiOutput: Module2AiOutput
): Module2BusinessOutput {
  const budgetLimit = round2(input.budgetLimit);

  const normalizedMix = aiOutput.recommendedMix
    .map(normalizeItem)
    .filter((item) => item.productName.trim().length > 1 && item.category.trim().length > 1);

  let mix = rebalanceToBudget(normalizedMix, budgetLimit);

  if (mix.length === 0) {
    mix = [
      {
        productName: "Starter Sustainable Supply Bundle",
        category: "Miscellaneous",
        estimatedUnitCost: round2(Math.max(1, Math.min(100, budgetLimit))),
        recommendedQuantity: 1,
        estimatedTotal: round2(Math.max(1, Math.min(100, budgetLimit))),
        reason: "Fallback bundle to keep proposal actionable under strict budget constraints."
      }
    ];
  }

  const productsTotal = round2(mix.reduce((sum, item) => sum + item.estimatedTotal, 0));
  let estimatedShipping = round2(Math.max(0, aiOutput.costBreakdown.estimatedShipping));

  if (productsTotal + estimatedShipping > budgetLimit) {
    estimatedShipping = 0;
  }

  const grandTotal = round2(productsTotal + estimatedShipping);
  const allocatedBudget = Math.min(budgetLimit, grandTotal);
  const remainingBudget = round2(Math.max(0, budgetLimit - allocatedBudget));

  const impactPositioningSummary = aiOutput.impactPositioningSummary.trim().replace(/\s+/g, " ");

  const output: Module2BusinessOutput = {
    recommendedMix: mix,
    budgetSummary: {
      budgetLimit,
      allocatedBudget,
      remainingBudget
    },
    costBreakdown: {
      productsTotal,
      estimatedShipping,
      grandTotal: allocatedBudget
    },
    impactPositioningSummary:
      impactPositioningSummary.length > 10
        ? impactPositioningSummary
        : "This proposal balances sustainability goals with budget discipline while improving client-facing ESG positioning."
  };

  return module2BusinessOutputSchema.parse(output);
}
