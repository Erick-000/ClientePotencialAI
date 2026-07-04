-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'DIAGNOSIS', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLIENT', 'DISCARDED');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Complexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "projectType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientBudget" INTEGER,
    "estimatedMinBudget" INTEGER,
    "estimatedBudget" INTEGER,
    "estimatedMaxBudget" INTEGER,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "LeadPriority",
    "complexity" "Complexity",
    "opportunityLevel" TEXT,
    "riskLevel" TEXT,
    "nextAction" TEXT,
    "suggestedMessage" TEXT,
    "scope" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
