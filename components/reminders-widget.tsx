"use client"

import { useEffect, useState } from "react"
import { format, isPast, isToday } from "date-fns"
import { es } from "date-fns/locale"
import {
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Reminder {
  id: string
  message: string
  dueAt: string
  done: boolean
  lead: { id: string; name: string }
}

export function RemindersWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReminders = async () => {
    setLoading(true)
    const res = await fetch("/api/reminders?pending=true")
    const data = await res.json()
    setReminders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  const markDone = async (id: string) => {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: true }),
    })
    setReminders((prev) => prev.filter((r) => r.id !== id))
    toast.success("Recordatorio completado")
  }

  const overdue = reminders.filter(
    (r) => !r.done && isPast(new Date(r.dueAt)) && !isToday(new Date(r.dueAt))
  )
  const todayReminders = reminders.filter(
    (r) => !r.done && isToday(new Date(r.dueAt))
  )
  const upcoming = reminders.filter(
    (r) =>
      !r.done &&
      !isPast(new Date(r.dueAt)) &&
      !isToday(new Date(r.dueAt))
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Recordatorios</h3>
          {reminders.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              {reminders.length}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <BellOff className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Sin recordatorios pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Vencidos */}
          {overdue.map((r) => (
            <ReminderItem key={r.id} reminder={r} variant="overdue" onDone={markDone} />
          ))}
          {/* Hoy */}
          {todayReminders.map((r) => (
            <ReminderItem key={r.id} reminder={r} variant="today" onDone={markDone} />
          ))}
          {/* Próximos */}
          {upcoming.map((r) => (
            <ReminderItem key={r.id} reminder={r} variant="upcoming" onDone={markDone} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReminderItem({
  reminder,
  variant,
  onDone,
}: {
  reminder: Reminder
  variant: "overdue" | "today" | "upcoming"
  onDone: (id: string) => void
}) {
  const colorMap = {
    overdue: "border-red-200 bg-red-50",
    today: "border-amber-200 bg-amber-50",
    upcoming: "border-slate-100 bg-slate-50",
  }
  const iconMap = {
    overdue: <Clock className="h-4 w-4 text-red-500" />,
    today: <Calendar className="h-4 w-4 text-amber-500" />,
    upcoming: <Calendar className="h-4 w-4 text-slate-400" />,
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 transition ${colorMap[variant]}`}
    >
      <div className="mt-0.5 flex-shrink-0">{iconMap[variant]}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {reminder.message}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <Link
            href={`/leads/${reminder.lead.id}`}
            className="truncate text-xs text-emerald-600 hover:underline"
          >
            {reminder.lead.name}
          </Link>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500">
            {format(new Date(reminder.dueAt), "d MMM yyyy", { locale: es })}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDone(reminder.id)}
        title="Marcar como completado"
        className="flex-shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-emerald-100 hover:text-emerald-600"
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
    </div>
  )
}
