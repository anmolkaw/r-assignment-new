import { ModuleType, RunStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function createProductRun(data: {
  productName: string;
  inputJson: Prisma.InputJsonValue;
  prompt: string;
}) {
  return prisma.productClassificationRun.create({
    data: {
      productName: data.productName,
      inputJson: data.inputJson,
      prompt: data.prompt,
      status: RunStatus.PENDING
    }
  });
}

export async function finalizeProductRun(
  runId: string,
  data: {
    rawAiResponse?: string;
    parsedOutputJson?: Prisma.InputJsonValue;
    status: RunStatus;
    errorMessage?: string;
  }
) {
  return prisma.productClassificationRun.update({
    where: { id: runId },
    data: {
      rawAiResponse: data.rawAiResponse,
      parsedOutputJson: data.parsedOutputJson,
      status: data.status,
      errorMessage: data.errorMessage
    }
  });
}

export async function createProposalRun(data: {
  clientName: string;
  industry: string;
  budgetLimit: number;
  inputJson: Prisma.InputJsonValue;
  prompt: string;
}) {
  return prisma.proposalRun.create({
    data: {
      clientName: data.clientName,
      industry: data.industry,
      budgetLimit: data.budgetLimit,
      inputJson: data.inputJson,
      prompt: data.prompt,
      status: RunStatus.PENDING
    }
  });
}

export async function finalizeProposalRun(
  runId: string,
  data: {
    rawAiResponse?: string;
    parsedOutputJson?: Prisma.InputJsonValue;
    status: RunStatus;
    errorMessage?: string;
  }
) {
  return prisma.proposalRun.update({
    where: { id: runId },
    data: {
      rawAiResponse: data.rawAiResponse,
      parsedOutputJson: data.parsedOutputJson,
      status: data.status,
      errorMessage: data.errorMessage
    }
  });
}

export async function createAiLog(data: {
  moduleType: ModuleType;
  prompt: string;
  rawResponse?: string;
  parsedResponseJson?: Prisma.InputJsonValue;
  success: boolean;
  errorMessage?: string;
}) {
  return prisma.aiLog.create({
    data: {
      moduleType: data.moduleType,
      prompt: data.prompt,
      rawResponse: data.rawResponse,
      parsedResponseJson: data.parsedResponseJson,
      success: data.success,
      errorMessage: data.errorMessage
    }
  });
}

export async function getRecentProductRuns(limit = 10) {
  return prisma.productClassificationRun.findMany({
    take: limit,
    orderBy: { createdAt: "desc" }
  });
}

export async function getRecentProposalRuns(limit = 10) {
  return prisma.proposalRun.findMany({
    take: limit,
    orderBy: { createdAt: "desc" }
  });
}

export async function getRecentLogs(limit = 30) {
  return prisma.aiLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" }
  });
}

export async function getDashboardStats() {
  const [totalProductsProcessed, totalProposalsGenerated, failedProductRuns, failedProposalRuns] =
    await Promise.all([
      prisma.productClassificationRun.count(),
      prisma.proposalRun.count(),
      prisma.productClassificationRun.count({ where: { status: RunStatus.FAILURE } }),
      prisma.proposalRun.count({ where: { status: RunStatus.FAILURE } })
    ]);

  const [recentProducts, recentProposals] = await Promise.all([
    prisma.productClassificationRun.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productName: true,
        status: true,
        errorMessage: true,
        createdAt: true
      }
    }),
    prisma.proposalRun.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientName: true,
        status: true,
        errorMessage: true,
        createdAt: true
      }
    })
  ]);

  const recentRuns = [...recentProducts.map((run) => ({ ...run, type: "MODULE_1" as const })),
    ...recentProposals.map((run) => ({ ...run, type: "MODULE_2" as const }))]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return {
    totalProductsProcessed,
    totalProposalsGenerated,
    recentFailures: failedProductRuns + failedProposalRuns,
    recentRuns
  };
}
