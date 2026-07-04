import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { LeadSchema } from "@/lib/validations"
import { cookies } from "next/headers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deviceId = (await cookies()).get("deviceId")?.value
  const { id } = await params
  const lead = await prisma.lead.findFirst({
    where: { id, deviceId },
  })

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json(lead)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deviceId = (await cookies()).get("deviceId")?.value
  const { id } = await params
  
  const existing = await prisma.lead.findFirst({ where: { id, deviceId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()
  const parsed = LeadSchema.partial().passthrough().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(lead)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deviceId = (await cookies()).get("deviceId")?.value
  const { id } = await params
  
  const existing = await prisma.lead.findFirst({ where: { id, deviceId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()

  const lead = await prisma.lead.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(lead)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deviceId = (await cookies()).get("deviceId")?.value
  const { id } = await params
  
  const existing = await prisma.lead.findFirst({ where: { id, deviceId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.lead.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
