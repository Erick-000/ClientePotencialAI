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
  arrayMove,
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const COLUMNS: {
  id: string
  label: string
  shortLabel: string
  dotColor: string
  emptyMsg: string
}[] = [
  { id: "NEW",           label: "Nuevo",        shortLabel: "Nuevo",    dotColor: "bg-blue-500",    emptyMsg: "Sin leads nuevos" },
  { id: "CONTACTED",     label: "Contactado",    shortLabel: "Contact.", dotColor: "bg-indigo-500",  emptyMsg: "Nadie contactado" },
  { id: "DIAGNOSIS",     label: "Diagnóstico",   shortLabel: "Diagnós.", dotColor: "bg-violet-500",  emptyMsg: "Sin diagnósticos" },
  { id: "PROPOSAL_SENT", label: "Propuesta",     shortLabel: "Propues.", dotColor: "bg-cyan-500",    emptyMsg: "Sin propuestas" },
  { id: "NEGOTIATION",   label: "Negociación",   shortLabel: "Negoc.",   dotColor: "bg-sky-500",     emptyMsg: "Sin negociaciones" },
  { id: "CLIENT",        label: "Cliente ✓",     shortLabel: "Cliente",  dotColor: "bg-emerald-500", emptyMsg: "Aún sin clientes" },
  { id: "DISCARDED",     label: "Descartado",    shortLabel: "Descart.", dotColor: "bg-rose-400",    emptyMsg: "Sin descartados" },
]

const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof AlertCircle }
> = {
  HIGH:   { label: "Alta",   className: "bg-red-50 text-red-600 border border-red-200",         icon: AlertCircle },
  MEDIUM: { label: "Media",  className: "bg-amber-50 text-amber-600 border border-amber-200",   icon: Clock },
  LOW:    { label: "Baja",   className: "bg-emerald-50 text-emerald-600 border border-emerald-200", icon: Zap },
}

function formatCop(v?: number | null) {
  if (!v) return null
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
  return `$${v.toLocaleString("es-CO")}`
}

// ─── Draggable Card ──────────────────────────────────────────────────────────

function LeadCard({ lead, isDragging = false }: { lead: Lead; isDragging?: boolean }) {
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
      className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute right-3 top-3 cursor-grab rounded-lg p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
        title="Arrastrar"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="p-4 pr-10">
        <p className="truncate text-sm font-bold leading-snug text-slate-900">{lead.name}</p>
        {lead.company && (
          <p className="mt-0.5 truncate text-xs text-slate-400">{lead.company}</p>
        )}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {lead.projectType}
        </p>

        {(priorityCfg || lead.estimatedBudget) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {priorityCfg && PriorityIcon && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityCfg.className}`}>
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

        <div className="mt-3 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[10px] text-slate-400">
            <Calendar className="h-3 w-3" />
            {format(new Date(lead.createdAt), "d MMM", { locale: es })}
          </p>
          <Link
            href={`/leads/${lead.id}`}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            Ver
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Column cards list (shared between mobile & desktop) ────────────────────

function ColumnCards({ column, leads }: { column: (typeof COLUMNS)[0]; leads: Lead[] }) {
  const totalBudget = leads.reduce((s, l) => s + (l.estimatedBudget ?? 0), 0)

  return (
    <>
      {totalBudget > 0 && (
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Pipeline:{" "}
          <span className="text-emerald-700">{formatCop(totalBudget)} COP</span>
        </p>
      )}
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}

          {leads.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
              <span className={`h-3 w-3 rounded-full ${column.dotColor} opacity-40`} />
              <p className="text-xs font-medium text-slate-400">{column.emptyMsg}</p>
              <p className="text-[10px] text-slate-300">Arrastra aquí</p>
            </div>
          )}
        </div>
      </SortableContext>
    </>
  )
}

// ─── Mobile: Tab selector + single column view ───────────────────────────────

function MobileKanban({ leads }: { leads: Lead[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const col = COLUMNS[activeIdx]
  const colLeads = leads.filter((l) => l.status === col.id)

  const prev = () => setActiveIdx((i) => Math.max(0, i - 1))
  const next = () => setActiveIdx((i) => Math.min(COLUMNS.length - 1, i + 1))

  return (
    <div className="flex flex-col gap-4">
      {/* Tab strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {COLUMNS.map((c, i) => {
          const count = leads.filter((l) => l.status === c.id).length
          return (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                i === activeIdx
                  ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${c.dotColor}`} />
              {c.shortLabel}
              {count > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 text-[10px] font-bold ${
                    i === activeIdx ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Column header bar */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          onClick={prev}
          disabled={activeIdx === 0}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:opacity-20"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
          <span className="text-sm font-bold text-slate-800">{col.label}</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600">
            {colLeads.length}
          </span>
        </div>

        <button
          onClick={next}
          disabled={activeIdx === COLUMNS.length - 1}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:opacity-20"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Cards for selected column */}
      <div className="min-h-[200px]">
        <ColumnCards column={col} leads={colLeads} />
      </div>
    </div>
  )
}

// ─── Desktop: full horizontal scroll board ──────────────────────────────────

function DesktopKanban({ leads }: { leads: Lead[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-8 pt-1">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.id)
        const totalBudget = colLeads.reduce((s, l) => s + (l.estimatedBudget ?? 0), 0)
        return (
          <div
            key={col.id}
            className="flex w-72 flex-shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 rounded-t-2xl bg-white px-4 py-3.5 shadow-sm">
              <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${col.dotColor}`} />
              <span className="flex-1 truncate text-sm font-bold text-slate-800">{col.label}</span>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600">
                {colLeads.length}
              </span>
            </div>

            {totalBudget > 0 && (
              <div className="border-b border-slate-200 bg-white/60 px-4 pb-2.5 pt-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Pipeline: <span className="text-emerald-700">{formatCop(totalBudget)} COP</span>
                </p>
              </div>
            )}

            <div className="flex min-h-[200px] flex-1 flex-col gap-2.5 p-3">
              <ColumnCards column={col} leads={colLeads} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Board (responsive) ─────────────────────────────────────────────────

export function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const getColumn = (id: string) => leads.find((l) => l.id === id)?.status

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const overColumn =
      COLUMNS.find((c) => c.id === over.id)?.id ?? getColumn(over.id as string)
    if (!overColumn) return
    setLeads((prev) =>
      prev.map((l) =>
        l.id === active.id ? { ...l, status: overColumn as Lead["status"] } : l
      )
    )
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const activeLeadId = active.id as string
    const overId = over.id as string
    const lead = leads.find((l) => l.id === activeLeadId)
    if (!lead) return

    // Check if dropped onto a column header or another card
    const overIsColumn = COLUMNS.some((c) => c.id === overId)
    const overLead = leads.find((l) => l.id === overId)
    const targetStatus = overIsColumn
      ? (overId as Lead["status"])
      : (overLead?.status ?? lead.status)

    // Determine the new state of the target column
    let newColLeads: Lead[] = []
    
    if (targetStatus === lead.status) {
      // Reordering within the same column
      const colLeads = leads.filter((l) => l.status === lead.status)
      const oldIdx = colLeads.findIndex((l) => l.id === activeLeadId)
      const newIdx = colLeads.findIndex((l) => l.id === overId)
      if (oldIdx !== newIdx) {
        newColLeads = arrayMove(colLeads, oldIdx, newIdx)
        setLeads((prev) => [
          ...prev.filter((l) => l.status !== lead.status),
          ...newColLeads,
        ])
      } else {
        return // no change
      }
    } else {
      // Moving to a different column
      // `handleDragOver` already moved it optimistically, but let's re-calculate to be safe
      // Actually `leads` state here already reflects the status change from `handleDragOver` 
      // EXCEPT the optimistic update in `handleDragOver` might have put it at the end.
      // We should use `arrayMove` if dropped over another item.
      const colLeads = leads.filter((l) => l.status === targetStatus && l.id !== activeLeadId)
      const overIdx = colLeads.findIndex((l) => l.id === overId)
      
      const updatedLead = { ...lead, status: targetStatus }
      
      if (overIsColumn || overIdx === -1) {
        newColLeads = [...colLeads, updatedLead]
      } else {
        // insert at specific position
        newColLeads = [
          ...colLeads.slice(0, overIdx),
          updatedLead,
          ...colLeads.slice(overIdx)
        ]
      }
      
      setLeads((prev) => [
        ...prev.filter((l) => l.status !== targetStatus && l.id !== activeLeadId),
        ...newColLeads,
      ])
    }

    // Persist to DB (bulk update order and status for the affected column)
    try {
      const payload = newColLeads.map((l, index) => ({
        id: l.id,
        order: index,
        status: targetStatus,
      }))
      
      await fetch(`/api/leads/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      })
    } catch {
      toast.error("Error al guardar el nuevo orden")
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
      {/* Mobile */}
      <div className="md:hidden">
        <MobileKanban leads={leads} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopKanban leads={leads} />
      </div>

      <DragOverlay
        dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}
      >
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
