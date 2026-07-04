import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// GET /api/leads/export?format=csv
export async function GET(req: NextRequest) {
  try {
    const deviceId = (await cookies()).get("deviceId")?.value
    if (!deviceId) return new NextResponse("No device ID", { status: 401 })

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") ?? "csv"

    const leads = await prisma.lead.findMany({
      where: { deviceId },
      orderBy: { createdAt: "desc" },
    })

    if (format === "csv") {
      const headers = [
        "ID",
        "Nombre",
        "Empresa",
        "Email",
        "Teléfono",
        "Tipo de proyecto",
        "Descripción",
        "Estado",
        "Prioridad",
        "Complejidad",
        "Presupuesto cliente (COP)",
        "Presupuesto estimado mín (COP)",
        "Presupuesto estimado rec (COP)",
        "Presupuesto estimado máx (COP)",
        "Nivel de oportunidad",
        "Nivel de riesgo",
        "Siguiente acción",
        "Notas",
        "Creado",
        "Actualizado",
      ]

      const rows = leads.map((l) => [
        l.id,
        l.name,
        l.company ?? "",
        l.email ?? "",
        l.phone ?? "",
        l.projectType,
        `"${l.description.replace(/"/g, '""')}"`,
        l.status,
        l.priority ?? "",
        l.complexity ?? "",
        l.clientBudget ?? "",
        l.estimatedMinBudget ?? "",
        l.estimatedBudget ?? "",
        l.estimatedMaxBudget ?? "",
        l.opportunityLevel ?? "",
        l.riskLevel ?? "",
        `"${(l.nextAction ?? "").replace(/"/g, '""')}"`,
        `"${(l.notes ?? "").replace(/"/g, '""')}"`,
        l.createdAt.toISOString(),
        l.updatedAt.toISOString(),
      ])

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      )

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="prospectos-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 })
  }
}
