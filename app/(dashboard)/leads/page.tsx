"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Lead } from "@prisma/client"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { LeadSchema } from "@/lib/validations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"

type LeadFormValues = z.infer<typeof LeadSchema>

const statusMap: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  DIAGNOSIS: "En Diagnóstico",
  PROPOSAL_SENT: "Propuesta Enviada",
  NEGOTIATION: "Negociación",
  CLIENT: "Cliente",
  DISCARDED: "Descartado",
}

const statusBadgeMap: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-indigo-100 text-indigo-800",
  DIAGNOSIS: "bg-violet-100 text-violet-800",
  PROPOSAL_SENT: "bg-cyan-100 text-cyan-800",
  NEGOTIATION: "bg-sky-100 text-sky-800",
  CLIENT: "bg-green-100 text-green-800",
  DISCARDED: "bg-red-100 text-red-800",
}

const priorityMap: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
}

const priorityBadgeMap: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-emerald-100 text-emerald-800",
}

function formatCop(value?: number | null) {
  if (!value) return "-"
  return `$${value.toLocaleString("es-CO")}`
}

const LEADS_PER_PAGE = 8

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(LeadSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      projectType: "",
      description: "",
      status: "NEW",
    },
    mode: "onTouched",
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    const response = await fetch("/api/leads")
    const data = await response.json()
    setLeads(data)
  }

  const filteredLeads = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter
      const searchableText = [
        lead.name,
        lead.company,
        lead.email,
        lead.phone,
        lead.projectType,
        lead.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return matchesStatus && (!search || searchableText.includes(search))
    })
  }, [leads, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PER_PAGE))
  const visibleStart = filteredLeads.length === 0 ? 0 : (currentPage - 1) * LEADS_PER_PAGE + 1
  const visibleEnd = Math.min(currentPage * LEADS_PER_PAGE, filteredLeads.length)

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * LEADS_PER_PAGE
    return filteredLeads.slice(start, start + LEADS_PER_PAGE)
  }, [currentPage, filteredLeads])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const activeLeads = leads.filter((lead) => !["CLIENT", "DISCARDED"].includes(lead.status)).length
  const clients = leads.filter((lead) => lead.status === "CLIENT").length

  const openCreateDialog = () => {
    reset({
      name: "",
      company: "",
      email: "",
      phone: "",
      projectType: "",
      description: "",
      status: "NEW",
    })
    setOpen(true)
  }

  const onSubmit = async (data: LeadFormValues) => {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        toast.error(result?.error || "Error al crear prospecto")
        return
      }

      toast.success("Prospecto creado exitosamente")
      setOpen(false)
      reset()
      fetchLeads()
    } catch {
      toast.error("Error al crear prospecto")
    }
  }

  const deleteLead = async () => {
    if (!deleteTarget) return

    try {
      const response = await fetch(`/api/leads/${deleteTarget.id}`, { method: "DELETE" })

      if (!response.ok) {
        toast.error("No se pudo eliminar el prospecto")
        return
      }

      toast.success("Prospecto eliminado")
      setDeleteTarget(null)
      fetchLeads()
    } catch {
      toast.error("Error al eliminar prospecto")
    }
  }

  const getStatusBadge = (status: string) => (
    <Badge className={statusBadgeMap[status]} variant="secondary">
      {statusMap[status] || status}
    </Badge>
  )

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return <span className="text-slate-400">Sin analizar</span>

    return (
      <Badge className={priorityBadgeMap[priority]} variant="secondary">
        {priorityMap[priority] || priority}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-2 md:pt-0">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 sm:flex">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Oportunidades comerciales
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">
                Prospectos
              </h1>
              <p className="mt-2 max-w-3xl text-slate-600">
                Un prospecto es una persona o empresa que puede convertirse en cliente. Aquí guardas su necesidad, presupuesto, estado y próxima acción para decidir si contactar, cotizar o descartar.
              </p>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={(value) => {
          setOpen(value)
          if (!value) reset()
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="h-12 bg-emerald-700 px-5 text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Prospecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-hidden border-slate-200 p-0 sm:max-w-[760px]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[92vh] flex-col">
              <DialogHeader className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-6 py-6">
                <div className="flex items-start gap-4 pr-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-100">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl text-slate-950">Nuevo Prospecto</DialogTitle>
                    <DialogDescription className="mt-2 text-slate-600">
                      Registra un posible cliente con suficiente contexto para decidir si vale la pena contactar, cotizar o descartar.
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  {["Contacto", "Necesidad", "Seguimiento"].map((step, index) => (
                    <div key={step} className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-slate-700">
                      <span className="font-bold text-emerald-700">{index + 1}.</span> {step}
                    </div>
                  ))}
                </div>
              </DialogHeader>

              <div className="grid flex-1 gap-5 overflow-y-auto px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="font-semibold text-slate-700">Nombre del contacto *</Label>
                    <Input id="name" {...register("name")} placeholder="Ej. Ana Rodríguez" className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm" aria-invalid={Boolean(errors.name)} />
                    {errors.name && <p className="text-sm font-medium text-red-600">{errors.name.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company" className="font-semibold text-slate-700">Empresa o negocio</Label>
                    <Input id="company" {...register("company")} placeholder="Ej. Clínica Aurora" className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-semibold text-slate-700">Email</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="email@ejemplo.com" className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm" aria-invalid={Boolean(errors.email)} />
                    {errors.email && <p className="text-sm font-medium text-red-600">{errors.email.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="font-semibold text-slate-700">Teléfono / WhatsApp</Label>
                    <Input id="phone" {...register("phone")} placeholder="+57 300 123 4567" className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                  <div className="grid gap-2">
                    <Label htmlFor="projectType" className="font-semibold text-slate-700">Necesidad o proyecto *</Label>
                    <Input id="projectType" {...register("projectType")} placeholder="Ej. Sitio web, reservas, ecommerce, automatización" className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm" aria-invalid={Boolean(errors.projectType)} />
                    {errors.projectType && <p className="text-sm font-medium text-red-600">{errors.projectType.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status" className="font-semibold text-slate-700">Estado inicial</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || "NEW"} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusMap).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description" className="font-semibold text-slate-700">Contexto de la oportunidad *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Cuenta qué necesita, para cuándo, qué problema intenta resolver, presupuesto aproximado y cualquier restricción importante."
                    className="min-h-[130px] resize-none rounded-2xl border-slate-200 bg-white shadow-sm"
                    aria-invalid={Boolean(errors.description)}
                  />
                  {errors.description && <p className="text-sm font-medium text-red-600">{errors.description.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clientBudget" className="font-semibold text-slate-700">Presupuesto que menciona el cliente</Label>
                  <Controller
                    name="clientBudget"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="clientBudget"
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="5.000.000"
                        className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                        aria-invalid={Boolean(errors.clientBudget)}
                      />
                    )}
                  />
                  {errors.clientBudget && <p className="text-sm font-medium text-red-600">{errors.clientBudget.message}</p>}
                </div>
              </div>

              <DialogFooter className="border-t border-slate-100 bg-white px-6 py-4 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 border-slate-300">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-11 bg-emerald-700 hover:bg-emerald-800">
                  {isSubmitting ? "Creando..." : "Crear prospecto"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Users className="h-4 w-4 text-blue-600" />
              Total de oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              En seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeLeads}</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <div className="h-4 w-4 rounded-full bg-green-600" />
              Convertidos en clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{clients}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, empresa, contacto o necesidad..."
                className="h-12 rounded-full border-slate-200 bg-white pl-11 pr-4 shadow-sm focus-visible:bg-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 rounded-full border-slate-200 bg-slate-50 px-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Filtrar por estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                {Object.entries(statusMap).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              Mostrando <span className="font-bold text-slate-900">{visibleStart}-{visibleEnd}</span> de {filteredLeads.length} oportunidades.
            </p>
            {(searchTerm || statusFilter !== "ALL") && (
              <Button variant="ghost" size="sm" onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
              }}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          {filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Contacto</TableHead>
                    <TableHead className="font-semibold text-slate-700">Necesidad</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="font-semibold text-slate-700">Prioridad</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Presupuesto</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-slate-50/80">
                      <TableCell className="min-w-[220px]">
                        <button
                          type="button"
                          onClick={() => router.push(`/leads/${lead.id}`)}
                          className="group text-left"
                        >
                          <span className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-emerald-700">
                            {lead.name}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                          </span>
                          <span className="block text-sm text-slate-500">{lead.company || lead.email || "Sin empresa registrada"}</span>
                        </button>
                      </TableCell>
                      <TableCell className="min-w-[240px] text-slate-600">{lead.projectType}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-700">{formatCop(lead.estimatedBudget || lead.clientBudget)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[190px]">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}`)} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}?tab=analysis`)} className="cursor-pointer">
                              <Sparkles className="mr-2 h-4 w-4" />
                              Analizar con IA
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}?edit=1`)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Editar datos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteTarget(lead)} className="cursor-pointer text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50">
                <Users className="h-8 w-8 text-emerald-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {leads.length === 0 ? "Aún no tienes oportunidades registradas" : "No encontramos oportunidades con esos filtros"}
              </h3>
              <p className="mt-2 max-w-md text-slate-500">
                {leads.length === 0
                  ? "Crea tu primer prospecto para empezar a organizar posibles clientes."
                  : "Prueba con otro nombre, empresa, necesidad o estado."}
              </p>
              {leads.length === 0 && (
                <Button onClick={openCreateDialog} className="mt-6 bg-emerald-700 hover:bg-emerald-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Prospecto
                </Button>
              )}
            </div>
          )}

          {filteredLeads.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-slate-500">
                Página <span className="font-bold text-slate-900">{currentPage}</span> de {totalPages}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="h-10 border-slate-200 px-3"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => totalPages <= 5 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, index, pages) => {
                    const previousPage = pages[index - 1]
                    const showGap = previousPage && page - previousPage > 1

                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showGap && <span className="px-1 text-sm text-slate-400">...</span>}
                        <Button
                          type="button"
                          variant={page === currentPage ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className={page === currentPage ? "h-10 w-10 bg-emerald-700 text-white hover:bg-emerald-800" : "h-10 w-10 border-slate-200"}
                          aria-label={`Ir a página ${page}`}
                        >
                          {page}
                        </Button>
                      </div>
                    )
                  })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 border-slate-200 px-3"
                  aria-label="Página siguiente"
                >
                  Siguiente
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(value) => !value && setDeleteTarget(null)}>
        <DialogContent className="border-slate-200 sm:max-w-[460px]">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle>Eliminar oportunidad</DialogTitle>
            <DialogDescription>
              Esto eliminará a {deleteTarget?.name}. La acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={deleteLead}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
