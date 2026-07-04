import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/reminders — recordatorios pendientes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const leadId = searchParams.get("leadId")
    const pendingOnly = searchParams.get("pending") === "true"

    const reminders = await prisma.reminder.findMany({
      where: {
        ...(leadId ? { leadId } : {}),
        ...(pendingOnly ? { done: false } : {}),
      },
      orderBy: { dueAt: "asc" },
      include: { lead: { select: { id: true, name: true } } },
    })
    return NextResponse.json(reminders)
  } catch {
    return NextResponse.json({ error: "Error al obtener recordatorios" }, { status: 500 })
  }
}

// POST /api/reminders — crear recordatorio
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { leadId, userId, message, dueAt } = body

    const reminder = await prisma.reminder.create({
      data: {
        leadId,
        userId: userId ?? null,
        message,
        dueAt: new Date(dueAt),
      },
      include: { lead: { select: { id: true, name: true } } },
    })
    return NextResponse.json(reminder, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear recordatorio" }, { status: 500 })
  }
}

// PATCH /api/reminders — marcar como completado
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, done } = body

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { done: done ?? true },
    })
    return NextResponse.json(reminder)
  } catch {
    return NextResponse.json({ error: "Error al actualizar recordatorio" }, { status: 500 })
  }
}
