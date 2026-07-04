import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { LeadSchema } from "@/lib/validations"
import { cookies } from "next/headers"

export async function GET() {
  const deviceId = (await cookies()).get("deviceId")?.value

  if (!deviceId) {
    return NextResponse.json([])
  }

  const leads = await prisma.lead.findMany({
    where: {
      deviceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  const deviceId = (await cookies()).get("deviceId")?.value

  if (!deviceId) {
    return NextResponse.json({ error: "Dispositivo no identificado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = LeadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const lead = await prisma.lead.create({
    data: {
      ...parsed.data,
      deviceId,
    },
  })

  return NextResponse.json(lead)
}
