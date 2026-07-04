import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const deviceId = cookieStore.get("deviceId")?.value

    if (!deviceId) {
      return new NextResponse("Unauthorized - Device ID missing", { status: 401 })
    }

    const { items } = await req.json()

    if (!Array.isArray(items)) {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    // Prepare a bulk update transaction
    // Only update items that belong to the current deviceId for security
    const updates = items.map((item: { id: string; order: number; status: string }) =>
      prisma.lead.updateMany({
        where: {
          id: item.id,
          deviceId: deviceId, // Ensure we only touch leads from this device
        },
        data: {
          order: item.order,
          status: item.status as any,
        },
      })
    )

    await prisma.$transaction(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[LEADS_REORDER]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
