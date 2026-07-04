export interface LeadAnalysis {
  priority: "HIGH" | "MEDIUM" | "LOW"
  complexity: "HIGH" | "MEDIUM" | "LOW"
  opportunityLevel: string
  riskLevel: string
  estimatedMinBudget: number
  estimatedBudget: number
  estimatedMaxBudget: number
  currency: string
  estimatedTimeline: string
  reason: string
  recommendedAction: string
  scope: string[]
  outOfScope: string[]
  deliverables: string[]
  suggestedMessage: string
}
