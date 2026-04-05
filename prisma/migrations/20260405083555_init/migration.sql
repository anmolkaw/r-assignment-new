-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILURE');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('MODULE_1', 'MODULE_2', 'MODULE_3', 'MODULE_4');

-- CreateTable
CREATE TABLE "ProductClassificationRun" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "inputJson" JSONB NOT NULL,
    "prompt" TEXT NOT NULL,
    "rawAiResponse" TEXT,
    "parsedOutputJson" JSONB,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductClassificationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalRun" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "budgetLimit" DOUBLE PRECISION NOT NULL,
    "inputJson" JSONB NOT NULL,
    "prompt" TEXT NOT NULL,
    "rawAiResponse" TEXT,
    "parsedOutputJson" JSONB,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLog" (
    "id" TEXT NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "rawResponse" TEXT,
    "parsedResponseJson" JSONB,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLog_pkey" PRIMARY KEY ("id")
);
