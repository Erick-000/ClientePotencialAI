import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { LeadSchema } from "@/lib/validations"

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = LeadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const lead = await prisma.lead.create({
    data: parsed.data,
  })

  return NextResponse.json(lead)
}
