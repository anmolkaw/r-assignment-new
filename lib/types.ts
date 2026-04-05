export type RunStatus = "PENDING" | "SUCCESS" | "FAILURE";
export type ModuleType = "MODULE_1" | "MODULE_2" | "MODULE_3" | "MODULE_4";

export type Module1Output = {
  primaryCategory: string;
  subCategory: string;
  seoTags: string[];
  sustainabilityFilters: string[];
  confidence: number;
  reasoningNotes?: string;
};

export type Module2Output = {
  recommendedMix: Array<{
    productName: string;
    category: string;
    estimatedUnitCost: number;
    recommendedQuantity: number;
    estimatedTotal: number;
    reason: string;
  }>;
  budgetSummary: {
    budgetLimit: number;
    allocatedBudget: number;
    remainingBudget: number;
  };
  costBreakdown: {
    productsTotal: number;
    estimatedShipping: number;
    grandTotal: number;
  };
  impactPositioningSummary: string;
};

export type ProductRun = {
  id: string;
  productName: string;
  inputJson: Record<string, unknown>;
  prompt: string;
  rawAiResponse: string | null;
  parsedOutputJson: Module1Output | null;
  status: RunStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProposalRun = {
  id: string;
  clientName: string;
  industry: string;
  budgetLimit: number;
  inputJson: Record<string, unknown>;
  prompt: string;
  rawAiResponse: string | null;
  parsedOutputJson: Module2Output | null;
  status: RunStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AiLogRecord = {
  id: string;
  moduleType: ModuleType;
  prompt: string;
  rawResponse: string | null;
  parsedResponseJson: Record<string, unknown> | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
};

export type DashboardStats = {
  totalProductsProcessed: number;
  totalProposalsGenerated: number;
  recentFailures: number;
  recentRuns: Array<{
    id: string;
    status: RunStatus;
    errorMessage: string | null;
    createdAt: string;
    type: "MODULE_1" | "MODULE_2";
    productName?: string;
    clientName?: string;
  }>;
};
