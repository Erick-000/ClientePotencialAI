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
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const COLUMNS: {
  id: string
  label: string
  headerColor: string
  dotColor: string
  accentColor: string
  emptyMsg: string
}[] = [
  {
    id: "NEW",
    label: "Nuevo",
    headerColor: "bg-blue-500",
    dotColor: "bg-blue-500",
    accentColor: "border-t-blue-400",
    emptyMsg: "Sin leads nuevos",
  },
  {
    id: "CONTACTED",
    label: "Contactado",
    headerColor: "bg-indigo-500",
    dotColor: "bg-indigo-500",
    accentColor: "border-t-indigo-400",
    emptyMsg: "Nadie contactado",
  },
  {
    id: "DIAGNOSIS",
    label: "Diagnóstico",
    headerColor: "bg-violet-500",
    dotColor: "bg-violet-500",
    accentColor: "border-t-violet-400",
    emptyMsg: "Sin diagnósticos",
  },
  {
    id: "PROPOSAL_SENT",
    label: "Propuesta",
    headerColor: "bg-cyan-500",
    dotColor: "bg-cyan-500",
    accentColor: "border-t-cyan-400",
    emptyMsg: "Sin propuestas enviadas",
  },
  {
    id: "NEGOTIATION",
    label: "Negociación",
    headerColor: "bg-sky-500",
    dotColor: "bg-sky-500",
    accentColor: "border-t-sky-400",
    emptyMsg: "Sin negociaciones",
  },
  {
    id: "CLIENT",
    label: "Cliente ✓",
    headerColor: "bg-emerald-500",
    dotColor: "bg-emerald-500",
    accentColor: "border-t-emerald-400",
    emptyMsg: "Aún sin clientes",
  },
  {
    id: "DISCARDED",
    label: "Descartado",
    headerColor: "bg-rose-400",
    dotColor: "bg-rose-400",
    accentColor: "border-t-rose-300",
    emptyMsg: "Sin descartados",
  },
]

const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof AlertCircle }
> = {
  HIGH: {
    label: "Alta",
    className: "bg-red-50 text-red-600 border border-red-200",
    icon: AlertCircle,
  },
  MEDIUM: {
    label: "Media",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
    icon: Clock,
  },
  LOW: {
    label: "Baja",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    icon: Zap,
  },
}

function formatCop(v?: number | null) {
  if (!v) return null
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
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

  const priorityCfg = lead.priority ? PRIORITY_CONFIG[lead.priority] : null
  const PriorityIcon = priorityCfg?.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md active:shadow-lg"
    >
      {/* Drag handle — always visible at top right */}
      <button
        {...attributes}
        {...listeners}
        className="absolute right-3 top-3 cursor-grab rounded-lg p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
        title="Arrastrar"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="p-4 pr-10">
        {/* Name & company */}
        <p className="truncate text-sm font-bold leading-snug text-slate-900">
          {lead.name}
        </p>
        {lead.company && (
          <p className="mt-0.5 truncate text-xs text-slate-400">{lead.company}</p>
        )}

        {/* Project type */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {lead.projectType}
        </p>

        {/* Badges row */}
        {(priorityCfg || lead.estimatedBudget) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {priorityCfg && PriorityIcon && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityCfg.className}`}
              >
                <PriorityIcon className="h-2.5 w-2.5" />
                {priorityCfg.label}
              </span>
            )}
            {lead.estimatedBudget && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                <DollarSign className="h-2.5 w-2.5" />
                {formatCop(lead.estimatedBudget)}
              </span>
            )}
          </div>
        )}

        {/* Footer: date + link */}
        <div className="mt-3 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[10px] text-slate-400">
            <Calendar className="h-3 w-3" />
            {format(new Date(lead.createdAt), "d MMM", { locale: es })}
          </p>
          <Link
            href={`/leads/${lead.id}`}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
            title="Ver detalle"
          >
            Ver
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
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
  const totalBudget = leads.reduce((s, l) => s + (l.estimatedBudget ?? 0), 0)

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm backdrop-blur-sm">
      {/* Column header */}
      <div className="flex items-center gap-2.5 rounded-t-2xl bg-white px-4 py-3.5 shadow-sm">
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${column.dotColor}`} />
        <span className="flex-1 truncate text-sm font-bold text-slate-800">
          {column.label}
        </span>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600">
          {leads.length}
        </span>
      </div>

      {/* Budget subtotal — only if there's data */}
      {totalBudget > 0 && (
        <div className="border-b border-slate-200 bg-white/60 px-4 pb-2.5 pt-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Pipeline:{" "}
            <span className="text-emerald-700">{formatCop(totalBudget)} COP</span>
          </p>
        </div>
      )}

      {/* Cards area */}
      <SortableContext
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-[200px] flex-1 flex-col gap-2.5 p-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}

          {leads.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <span className={`h-3 w-3 rounded-full ${column.dotColor} opacity-40`} />
              </div>
              <p className="text-xs font-medium text-slate-400">{column.emptyMsg}</p>
              <p className="text-[10px] text-slate-300">Arrastra aquí</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const getColumn = (id: string) => leads.find((l) => l.id === id)?.status

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const overColumn =
      COLUMNS.find((c) => c.id === overId)?.id ?? getColumn(overId)

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
      {/* Scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-8 pt-1">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            leads={leads.filter((l) => l.status === col.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
        {activeLead ? (
          <div className="rotate-1 scale-105 opacity-95">
            <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl">
              <p className="text-sm font-bold text-slate-900">{activeLead.name}</p>
              {activeLead.company && (
                <p className="mt-0.5 text-xs text-slate-400">{activeLead.company}</p>
              )}
              <p className="mt-1.5 line-clamp-1 text-xs text-slate-500">
                {activeLead.projectType}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
