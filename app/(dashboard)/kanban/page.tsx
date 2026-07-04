import prisma from "@/lib/prisma"
import { KanbanBoard } from "@/components/kanban-board"
import { LayoutDashboard } from "lucide-react"
import { cookies } from "next/headers"

export default async function KanbanPage() {
  const deviceId = (await cookies()).get("deviceId")?.value
  const leads = await prisma.lead.findMany({
    where: deviceId ? { deviceId } : { deviceId: "none" },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <LayoutDashboard className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline Kanban</h1>
          <p className="text-sm text-slate-500">
            Arrastra los prospectos entre columnas para actualizar su estado.
          </p>
        </div>
      </div>

      {/* Board */}
      <KanbanBoard initialLeads={leads} />
    </div>
  )
}
