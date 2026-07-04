import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"
import { LeadAnalysis } from "@/types"

type AnalyzeLeadInput = {
  name?: string
  company?: string
  projectType?: string
  description?: string
  clientBudget?: number
}

function isLeadAnalysis(value: unknown): value is LeadAnalysis {
  if (!value || typeof value !== "object") return false

  const analysis = value as Partial<LeadAnalysis>
  return (
    ["HIGH", "MEDIUM", "LOW"].includes(String(analysis.priority)) &&
    ["HIGH", "MEDIUM", "LOW"].includes(String(analysis.complexity)) &&
    typeof analysis.opportunityLevel === "string" &&
    typeof analysis.riskLevel === "string" &&
    typeof analysis.estimatedMinBudget === "number" &&
    typeof analysis.estimatedBudget === "number" &&
    typeof analysis.estimatedMaxBudget === "number" &&
    analysis.currency === "COP" &&
    typeof analysis.estimatedTimeline === "string" &&
    typeof analysis.reason === "string" &&
    typeof analysis.recommendedAction === "string" &&
    Array.isArray(analysis.scope) &&
    Array.isArray(analysis.outOfScope) &&
    Array.isArray(analysis.deliverables) &&
    typeof analysis.suggestedMessage === "string"
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Error desconocido"
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Falta configurar OPENAI_API_KEY en el archivo .env para usar el análisis con IA.",
        },
        { status: 503 }
      )
    }

    const leadInput: AnalyzeLeadInput = await request.json()
    const { name, company, projectType, description, clientBudget } = leadInput

    const prompt = `
Eres un asistente comercial para freelancers y desarrolladores. Analiza el siguiente prospecto y devuelve un JSON con la siguiente estructura EXACTA (sin texto adicional):

{
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "complexity": "HIGH" | "MEDIUM" | "LOW",
  "opportunityLevel": string,
  "riskLevel": string,
  "estimatedMinBudget": number (en COP, solo números, sin símbolos ni decimales),
  "estimatedBudget": number (en COP, solo números, sin símbolos ni decimales),
  "estimatedMaxBudget": number (en COP, solo números, sin símbolos ni decimales),
  "currency": "COP",
  "estimatedTimeline": string,
  "reason": string,
  "recommendedAction": string,
  "scope": string[],
  "outOfScope": string[],
  "deliverables": string[],
  "suggestedMessage": string
}

Datos del prospecto:
- Nombre: ${name}
- Empresa: ${company || "No especificada"}
- Tipo de proyecto: ${projectType}
- Descripción: ${description}
- Presupuesto del cliente: ${clientBudget || "No especificado"} COP

Instrucciones:
1. priority: HIGH si el presupuesto es razonable y la necesidad es clara, MEDIUM si hay dudas, LOW si es muy complicado o presupuesto bajo
2. complexity: Basado en la descripción del proyecto
3. estimatedMinBudget, estimatedBudget, estimatedMaxBudget: Estimaciones realistas en pesos colombianos (COP) para un freelancer/pequeña agencia. Considera:
   - Sitio web simple: 500.000 - 1.500.000 COP
   - Landing page: 800.000 - 2.000.000 COP
   - Aplicación web básica: 2.000.000 - 5.000.000 COP
   - Aplicación compleja: 5.000.000+ COP
4. suggestedMessage: Mensaje profesional para contactar al cliente, tono consultivo
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que SOLO devuelve JSON válido. No incluyas texto adicional ni markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    const analysis = JSON.parse(content)

    if (!isLeadAnalysis(analysis)) {
      throw new Error("OpenAI devolvió un análisis con formato inválido")
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing lead:", error)
    return NextResponse.json(
      {
        error:
          "No se pudo completar el análisis con IA. Revisa la conexión del servidor con OpenAI y que OPENAI_API_KEY sea válida.",
        detail: getErrorMessage(error),
      },
      { status: 503 }
    )
  }
}
