"use client"

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Lead } from "@prisma/client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  GripVertical,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const COLUMNS: { id: string; label: string; color: string; dotColor: string }[] = [
  { id: "NEW", label: "Nuevo", color: "bg-blue-50 border-blue-200", dotColor: "bg-blue-500" },
  { id: "CONTACTED", label: "Contactado", color: "bg-indigo-50 border-indigo-200", dotColor: "bg-indigo-500" },
  { id: "DIAGNOSIS", label: "Diagnóstico", color: "bg-violet-50 border-violet-200", dotColor: "bg-violet-500" },
  { id: "PROPOSAL_SENT", label: "Propuesta", color: "bg-cyan-50 border-cyan-200", dotColor: "bg-cyan-500" },
  { id: "NEGOTIATION", label: "Negociación", color: "bg-sky-50 border-sky-200", dotColor: "bg-sky-500" },
  { id: "CLIENT", label: "Cliente ✓", color: "bg-emerald-50 border-emerald-200", dotColor: "bg-emerald-500" },
  { id: "DISCARDED", label: "Descartado", color: "bg-red-50 border-red-200", dotColor: "bg-red-400" },
]

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700",
}
const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
}

function formatCop(v?: number | null) {
  if (!v) return null
  return `$${v.toLocaleString("es-CO")}`
}

// ─── Draggable Card ─────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  isDragging = false,
}: {
  lead: Lead
  isDragging?: boolean
}) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-grab p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="pr-6">
        <p className="truncate text-sm font-bold text-slate-900">{lead.name}</p>
        {lead.company && (
          <p className="mt-0.5 truncate text-xs text-slate-500">{lead.company}</p>
        )}
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
          {lead.projectType}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {lead.priority && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[lead.priority] ?? ""}`}
            >
              {PRIORITY_LABELS[lead.priority]}
            </span>
          )}
          {lead.estimatedBudget && (
            <span className="flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              <DollarSign className="h-2.5 w-2.5" />
              {formatCop(lead.estimatedBudget)}
            </span>
          )}
        </div>
        <Link
          href={`/leads/${lead.id}`}
          className="flex-shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
          title="Ver detalle"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Date */}
      <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
        <Calendar className="h-3 w-3" />
        {format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })}
      </p>
    </div>
  )
}

// ─── Column ──────────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  leads,
}: {
  column: (typeof COLUMNS)[0]
  leads: Lead[]
}) {
  return (
    <div
      className={`flex min-h-[500px] w-72 flex-shrink-0 flex-col rounded-2xl border ${column.color} p-3`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
        <span className="text-sm font-bold text-slate-800">{column.label}</span>
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-600 shadow-sm">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>

      {leads.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-slate-400">Sin prospectos</p>
        </div>
      )}
    </div>
  )
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const getColumn = (id: string) => leads.find((l) => l.id === id)?.status

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // overId can be a column ID or another lead ID
    const overColumn = COLUMNS.find((c) => c.id === overId)?.id
      ?? getColumn(overId)

    if (!overColumn) return

    setLeads((prev) =>
      prev.map((l) =>
        l.id === activeId ? { ...l, status: overColumn as Lead["status"] } : l
      )
    )
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const lead = leads.find((l) => l.id === active.id)
    if (!lead) return

    // Persist to DB
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: lead.status }),
      })
    } catch {
      toast.error("Error al actualizar el estado")
    }
  }

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            leads={leads.filter((l) => l.status === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-2 opacity-90">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="text-sm font-bold text-slate-900">{activeLead.name}</p>
              {activeLead.company && (
                <p className="mt-0.5 text-xs text-slate-500">{activeLead.company}</p>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
