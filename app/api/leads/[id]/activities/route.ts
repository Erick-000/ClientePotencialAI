import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/leads/[id]/activities — listar historial
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activities = await prisma.activity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    })
    return NextResponse.json(activities)
  } catch {
    return NextResponse.json({ error: "Error al obtener actividades" }, { status: 500 })
  }
}

// POST /api/leads/[id]/activities — registrar nueva actividad
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type, detail, userId } = body

    const activity = await prisma.activity.create({
      data: {
        leadId: id,
        type,
        detail: detail ?? null,
        userId: userId ?? null,
      },
      include: { user: { select: { name: true, email: true } } },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al registrar actividad" }, { status: 500 })
  }
}
