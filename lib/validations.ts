import { z } from "zod"

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
)

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email("Ingresa un email válido").optional()
)

const optionalPositiveInt = z.preprocess(
  (value) => {
    if (value === "" || value === null || typeof value === "undefined") return undefined
    if (typeof value === "number" && Number.isNaN(value)) return undefined
    return value
  },
  z.coerce
    .number({ invalid_type_error: "Ingresa un valor numérico" })
    .int("El presupuesto debe ser un número entero")
    .positive("El presupuesto debe ser mayor a cero")
    .optional()
)

export const LeadSchema = z.object({
  name: z.string().trim().min(2, "Nombre debe tener al menos 2 caracteres"),
  company: optionalText,
  email: optionalEmail,
  phone: optionalText,
  projectType: z.string().trim().min(2, "Tipo de proyecto es requerido"),
  description: z.string().trim().min(12, "Describe un poco mejor la necesidad del cliente"),
  clientBudget: optionalPositiveInt,
  status: z.enum(["NEW", "CONTACTED", "DIAGNOSIS", "PROPOSAL_SENT", "NEGOTIATION", "CLIENT", "DISCARDED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  opportunityLevel: optionalText,
  riskLevel: optionalText,
  nextAction: optionalText,
  suggestedMessage: optionalText,
  scope: z.any().optional(),
  notes: optionalText,
})
