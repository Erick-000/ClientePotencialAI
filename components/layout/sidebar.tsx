"use client"

import { cn } from "@/lib/utils"
import { ArrowLeft, BarChart3, Download, Kanban, PlusCircle, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: "/leads",
      label: "Prospectos",
      icon: Users,
    },
    {
      href: "/kanban",
      label: "Kanban",
      icon: Kanban,
    },
  ]

  const handleExport = async () => {
    try {
      const res = await fetch("/api/leads/export?format=csv")
      if (!res.ok) throw new Error("Error al exportar")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `prospectos-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("CSV descargado")
    } catch {
      toast.error("Error al exportar CSV")
    }
  }

  return (
    <aside className={cn("flex h-screen w-72 flex-col border-r border-slate-200 bg-white md:sticky md:left-0 md:top-0 md:w-64 md:z-30", className)}>
      {/* Logo Section */}
      <div className="border-b border-slate-100 p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-white shadow-sm">
            <Image
              src="/favicon.png"
              alt="ClientePotencial AI"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-base font-bold text-slate-900">
              ClientePotencial
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">AI CRM</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "border border-emerald-100 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors duration-200", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4">
        <Link
          href="/leads"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Captura rápida</p>
            <p className="text-xs text-slate-500">Agrega y califica un prospecto.</p>
          </div>
        </Link>

        <button
          onClick={handleExport}
          className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800"
        >
          <Download className="h-5 w-5 text-slate-400" />
          <span>Exportar CSV</span>
        </button>

        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
            pathname === "/"
              ? "border border-emerald-100 bg-emerald-50 text-emerald-800 shadow-sm"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          )}
        >
          <ArrowLeft className={cn("h-5 w-5", pathname === "/" ? "text-emerald-600" : "text-slate-400")} />
          <span>Volver al inicio</span>
        </Link>
      </div>
    </aside>
  )
}
