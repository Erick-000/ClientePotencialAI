"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Activity,
  BotMessageSquare,
  CalendarDays,
  CheckCircle,
  Edit,
  Loader2,
  Mail,
  MessageSquarePlus,
  Phone,
  Plus,
  StickyNote,
  Users,
} from "lucide-react"
import { toast } from "sonner"

interface ActivityItem {
  id: string
  type: string
  detail: string | null
  createdAt: string
  user: { name: string | null; email: string } | null
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  CREATED: <Plus className="h-3.5 w-3.5" />,
  UPDATED: <Edit className="h-3.5 w-3.5" />,
  STATUS_CHANGED: <CheckCircle className="h-3.5 w-3.5" />,
  NOTE_ADDED: <StickyNote className="h-3.5 w-3.5" />,
  EMAIL_SENT: <Mail className="h-3.5 w-3.5" />,
  CALL_MADE: <Phone className="h-3.5 w-3.5" />,
  MEETING_HELD: <Users className="h-3.5 w-3.5" />,
  AI_ANALYZED: <BotMessageSquare className="h-3.5 w-3.5" />,
}

const ACTIVITY_LABELS: Record<string, string> = {
  CREATED: "Prospecto creado",
  UPDATED: "Información actualizada",
  STATUS_CHANGED: "Estado cambiado",
  NOTE_ADDED: "Nota agregada",
  EMAIL_SENT: "Email enviado",
  CALL_MADE: "Llamada realizada",
  MEETING_HELD: "Reunión realizada",
  AI_ANALYZED: "Análisis con IA ejecutado",
}

const ACTIVITY_COLORS: Record<string, string> = {
  CREATED: "bg-emerald-100 text-emerald-700",
  UPDATED: "bg-blue-100 text-blue-700",
  STATUS_CHANGED: "bg-violet-100 text-violet-700",
  NOTE_ADDED: "bg-amber-100 text-amber-700",
  EMAIL_SENT: "bg-cyan-100 text-cyan-700",
  CALL_MADE: "bg-orange-100 text-orange-700",
  MEETING_HELD: "bg-pink-100 text-pink-700",
  AI_ANALYZED: "bg-purple-100 text-purple-700",
}

const ACTIVITY_TYPES = [
  { value: "NOTE_ADDED", label: "Nota" },
  { value: "EMAIL_SENT", label: "Email enviado" },
  { value: "CALL_MADE", label: "Llamada" },
  { value: "MEETING_HELD", label: "Reunión" },
  { value: "STATUS_CHANGED", label: "Cambio de estado" },
]

export function ActivityFeed({ leadId }: { leadId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState("NOTE_ADDED")
  const [detail, setDetail] = useState("")
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchActivities = async () => {
    setLoading(true)
    const res = await fetch(`/api/leads/${leadId}/activities`)
    const data = await res.json()
    setActivities(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchActivities()
  }, [leadId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, detail }),
      })
      if (res.ok) {
        const newActivity = await res.json()
        setActivities((prev) => [newActivity, ...prev])
        setDetail("")
        setShowForm(false)
        toast.success("Actividad registrada")
      }
    } catch {
      toast.error("Error al registrar actividad")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Historial de actividades
          </h3>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Registrar
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Tipo de actividad
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Detalle (opcional)
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="Agrega notas sobre esta actividad…"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {adding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CalendarDays className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Sin actividades registradas</p>
          <p className="text-xs text-slate-400">
            Registra llamadas, emails o reuniones aquí.
          </p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100" />
          {activities.map((activity, idx) => (
            <div key={activity.id} className="relative flex gap-4 pb-5">
              {/* Dot */}
              <div
                className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${ACTIVITY_COLORS[activity.type] ?? "bg-slate-100 text-slate-600"}`}
              >
                {ACTIVITY_ICONS[activity.type] ?? (
                  <Activity className="h-3.5 w-3.5" />
                )}
              </div>
              {/* Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-slate-800">
                  {ACTIVITY_LABELS[activity.type] ?? activity.type}
                </p>
                {activity.detail && (
                  <p className="mt-0.5 text-sm text-slate-600">
                    {activity.detail}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {activity.user && (
                    <span className="text-xs text-slate-400">
                      {activity.user.name ?? activity.user.email}
                    </span>
                  )}
                  {activity.user && (
                    <span className="text-xs text-slate-300">·</span>
                  )}
                  <span className="text-xs text-slate-400">
                    {format(new Date(activity.createdAt), "d MMM yyyy HH:mm", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
