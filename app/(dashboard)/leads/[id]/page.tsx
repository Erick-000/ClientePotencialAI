"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CurrencyInput, type Currency } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  AlertTriangle,
  Edit,
  Trash2,
  Sparkles,
  Copy,
  Check,
} from "lucide-react"
import { Lead } from "@prisma/client"
import { LeadAnalysis } from "@/types"
import { LeadSchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ActivityFeed } from "@/components/activity-feed"

type LeadFormValues = z.infer<typeof LeadSchema>

function formatCopValue(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Por estimar"
  return `$${value.toLocaleString("es-CO")} COP`
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<LeadAnalysis | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [formCurrency, setFormCurrency] = useState<Currency>("COP")

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(LeadSchema),
    mode: "onTouched",
  })

  useEffect(() => {
    fetchLead()
  }, [params.id])

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab")
    if (tab) setActiveTab(tab)
  }, [])

  useEffect(() => {
    const shouldOpenEdit = new URLSearchParams(window.location.search).get("edit") === "1"
    if (lead && shouldOpenEdit) {
      setFormCurrency("COP")
      reset(getLeadFormValues(lead))
      setEditOpen(true)
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [lead, reset])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setLead(data)
        if (data.scope) {
          setAnalysis(data.scope as unknown as LeadAnalysis)
        }
      } else {
        toast.error("Error al cargar el prospecto")
      }
    } catch (error) {
      toast.error("Error al cargar el prospecto")
    } finally {
      setLoading(false)
    }
  }

  const analyzeLead = async () => {
    if (!lead) return

    setAnalyzing(true)
    try {
      const response = await fetch("/api/ai/analyze-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: lead.name,
          company: lead.company,
          projectType: lead.projectType,
          description: lead.description,
          clientBudget: lead.clientBudget,
        }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok) {
        setAnalysis(data)

        await fetch(`/api/leads/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: data.priority,
            complexity: data.complexity,
            opportunityLevel: data.opportunityLevel,
            riskLevel: data.riskLevel,
            estimatedMinBudget: data.estimatedMinBudget,
            estimatedBudget: data.estimatedBudget,
            estimatedMaxBudget: data.estimatedMaxBudget,
            nextAction: data.recommendedAction,
            suggestedMessage: data.suggestedMessage,
            scope: data,
          }),
        })

        fetchLead()
        toast.success("Análisis completado exitosamente")
      } else {
        toast.error(data?.error || "Error al analizar el prospecto")
      }
    } catch (error) {
      toast.error("Error al analizar el prospecto")
    } finally {
      setAnalyzing(false)
    }
  }

  const USD_TO_COP = 4200 // approximate fixed rate

  const onEditSubmit = async (data: LeadFormValues) => {
    try {
      const budgetCOP = data.clientBudget 
        ? (formCurrency === "USD" ? Math.round(data.clientBudget * USD_TO_COP) : data.clientBudget) 
        : undefined

      const payload = { ...data, clientBudget: budgetCOP }

      const response = await fetch(`/api/leads/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Prospecto actualizado exitosamente")
        setEditOpen(false)
        fetchLead()
      } else {
        toast.error("Error al actualizar prospecto")
      }
    } catch (error) {
      toast.error("Error al actualizar prospecto")
    }
  }

  const onDelete = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Prospecto eliminado exitosamente")
        router.push("/leads")
      } else {
        toast.error("Error al eliminar prospecto")
      }
    } catch (error) {
      toast.error("Error al eliminar prospecto")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLeadFormValues = (leadData: Lead): LeadFormValues => ({
    name: leadData.name,
    company: leadData.company || undefined,
    email: leadData.email || undefined,
    phone: leadData.phone || undefined,
    projectType: leadData.projectType,
    description: leadData.description,
    clientBudget: leadData.clientBudget || undefined,
    status: leadData.status,
    priority: leadData.priority || undefined,
    complexity: leadData.complexity || undefined,
    opportunityLevel: leadData.opportunityLevel || undefined,
    riskLevel: leadData.riskLevel || undefined,
    nextAction: leadData.nextAction || undefined,
    suggestedMessage: leadData.suggestedMessage || undefined,
    scope: leadData.scope || undefined,
    notes: leadData.notes || undefined,
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      NEW: "Nuevo",
      CONTACTED: "Contactado",
      DIAGNOSIS: "En Diagnóstico",
      PROPOSAL_SENT: "Propuesta Enviada",
      NEGOTIATION: "Negociación",
      CLIENT: "Cliente",
      DISCARDED: "Descartado",
    }

    const colorMap: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-800",
      CONTACTED: "bg-indigo-100 text-indigo-800",
      DIAGNOSIS: "bg-violet-100 text-violet-800",
      PROPOSAL_SENT: "bg-cyan-100 text-cyan-800",
      NEGOTIATION: "bg-sky-100 text-sky-800",
      CLIENT: "bg-green-100 text-green-800",
      DISCARDED: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colorMap[status]} variant="secondary">
        {statusMap[status] || status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null

    const priorityMap: Record<string, string> = {
      HIGH: "Alta",
      MEDIUM: "Media",
      LOW: "Baja",
    }

    const colorMap: Record<string, string> = {
      HIGH: "bg-red-100 text-red-800",
      MEDIUM: "bg-amber-100 text-amber-800",
      LOW: "bg-emerald-100 text-emerald-800",
    }

    return (
      <Badge className={colorMap[priority]} variant="secondary">
        {priorityMap[priority] || priority}
      </Badge>
    )
  }

  const getComplexityBadge = (complexity: string | null) => {
    if (!complexity) return null

    const complexityMap: Record<string, string> = {
      HIGH: "Alta",
      MEDIUM: "Media",
      LOW: "Baja",
    }

    const colorMap: Record<string, string> = {
      HIGH: "bg-red-100 text-red-800",
      MEDIUM: "bg-amber-100 text-amber-800",
      LOW: "bg-emerald-100 text-emerald-800",
    }

    return (
      <Badge className={colorMap[complexity]} variant="secondary">
        {complexityMap[complexity] || complexity}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-2 md:pt-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col gap-4 pt-2 md:pt-0">
        <p>Prospecto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-2 md:pt-0">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{lead.name}</h1>
        <div className="flex-1" />
        <Button
          onClick={() => {
            reset(getLeadFormValues(lead))
            setEditOpen(true)
          }}
          className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-sm"
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 flex-wrap h-auto p-1">
          <TabsTrigger value="info">Resumen</TabsTrigger>
          <TabsTrigger value="analysis">Análisis IA</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="scope">Alcance</TabsTrigger>
          <TabsTrigger value="message">Mensaje</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">Detalles del Prospecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">Empresa</Label>
                  <p className="text-sm text-gray-500">
                    {lead.company || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Email</Label>
                  <p className="text-sm text-gray-500">
                    {lead.email || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Teléfono</Label>
                  <p className="text-sm text-gray-500">
                    {lead.phone || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Estado</Label>
                  <div className="mt-1">{getStatusBadge(lead.status)}</div>
                </div>
                {lead.priority && (
                  <div>
                    <Label className="text-gray-700 font-medium">Prioridad</Label>
                    <div className="mt-1">{getPriorityBadge(lead.priority)}</div>
                  </div>
                )}
                {lead.complexity && (
                  <div>
                    <Label className="text-gray-700 font-medium">Complejidad</Label>
                    <div className="mt-1">
                      {getComplexityBadge(lead.complexity)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">Tipo de Proyecto</Label>
                  <p className="text-sm text-gray-500">
                    {lead.projectType}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Descripción</Label>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {lead.description}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Presupuesto del Cliente</Label>
                  <p className="text-sm text-gray-500">
                    {lead.clientBudget ? formatCopValue(lead.clientBudget) : "-"}
                  </p>
                </div>
                {lead.estimatedBudget && (
                  <div>
                    <Label className="text-gray-700 font-medium">Presupuesto Estimado</Label>
                    <p className="text-sm text-gray-500">
                      {formatCopValue(lead.estimatedMinBudget)} - {formatCopValue(lead.estimatedMaxBudget)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {lead.notes && (
              <Card className="border border-gray-100 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Notas Internas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{lead.notes}</p>
                </CardContent>
              </Card>
            )}

            {lead.nextAction && (
              <Card className="border border-gray-100 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Siguiente Acción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{lead.nextAction}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <div className="max-w-3xl">
            <ActivityFeed leadId={lead.id} />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 pt-4">
          <Card className="border border-gray-100 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">Análisis de Oportunidad</CardTitle>
              <CardDescription className="text-gray-500">
                Utiliza IA para analizar el prospecto y obtener recomendaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={analyzeLead} disabled={analyzing} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Sparkles className="mr-2 h-4 w-4" />
                {analyzing ? "Analizando..." : "Analizar con IA"}
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">Resumen del Análisis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Prioridad</Label>
                    <div className="mt-1">
                      {getPriorityBadge(analysis.priority)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Complejidad</Label>
                    <div className="mt-1">
                      {getComplexityBadge(analysis.complexity)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Nivel de Oportunidad</Label>
                    <p className="text-sm text-gray-500">
                      {analysis.opportunityLevel}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Nivel de Riesgo</Label>
                    <p className="text-sm text-gray-500">
                      {analysis.riskLevel}
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div>
                  <Label className="text-gray-700 font-medium">Razón</Label>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {analysis.reason}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Acción Recomendada</Label>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {analysis.recommendedAction}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-6 pt-4">
          {analysis && (
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">Presupuesto Estimado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <Label className="text-gray-700 font-medium block mb-2">Mínimo</Label>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCopValue(analysis.estimatedMinBudget).replace(" COP", "")}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">COP</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <Label className="text-emerald-700 font-semibold block mb-2">Recomendado</Label>
                    <p className="text-3xl font-bold text-emerald-700">
                      {formatCopValue(analysis.estimatedBudget).replace(" COP", "")}
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">COP</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <Label className="text-gray-700 font-medium block mb-2">Máximo</Label>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCopValue(analysis.estimatedMaxBudget).replace(" COP", "")}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">COP</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Tiempo Estimado</Label>
                  <p className="text-sm text-gray-500 mt-2">
                    {analysis.estimatedTimeline}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <p className="text-xs text-amber-700">
                    ⚠️ Estimación orientativa basada en alcance, complejidad y esfuerzo esperado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {!analysis && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Analiza el prospecto primero
              </h3>
              <p className="text-gray-500 mb-6">
                Haz clic en el botón de análisis para obtener recomendaciones de presupuesto
              </p>
              <Button onClick={analyzeLead} disabled={analyzing} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Sparkles className="mr-2 h-4 w-4" />
                {analyzing ? "Analizando..." : "Analizar con IA"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scope" className="space-y-6 pt-4">
          {analysis && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border border-gray-100 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Alcance Incluido</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-500">
                    {(analysis.scope || []).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Fuera de Alcance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-500">
                    {(analysis.outOfScope || []).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Entregables</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-500">
                    {(analysis.deliverables || []).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
          {!analysis && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Analiza el prospecto primero
              </h3>
              <p className="text-gray-500 mb-6">
                Haz clic en el botón de análisis para obtener recomendaciones de alcance
              </p>
              <Button onClick={analyzeLead} disabled={analyzing} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Sparkles className="mr-2 h-4 w-4" />
                {analyzing ? "Analizando..." : "Analizar con IA"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="message" className="space-y-6 pt-4">
          {analysis && (
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Mensaje Sugerido</CardTitle>
                  <CardDescription className="text-gray-500">
                    Copia este mensaje para contactar al cliente
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(analysis.suggestedMessage || "")}
                  className="border-gray-200"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {analysis.suggestedMessage || "Aún no hay mensaje sugerido para este prospecto."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {!analysis && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Analiza el prospecto primero
              </h3>
              <p className="text-gray-500 mb-6">
                Haz clic en el botón de análisis para obtener un mensaje sugerido
              </p>
              <Button onClick={analyzeLead} disabled={analyzing} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Sparkles className="mr-2 h-4 w-4" />
                {analyzing ? "Analizando..." : "Analizar con IA"}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={(val) => {
        setEditOpen(val)
        if (val) setFormCurrency("COP")
      }}>
        <DialogContent className="max-h-[92vh] overflow-hidden border-slate-200 p-0 sm:max-w-[720px]">
          <form onSubmit={handleSubmit(onEditSubmit)} className="flex max-h-[92vh] flex-col">
            <DialogHeader className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-6 py-5">
              <DialogTitle className="text-2xl text-slate-950">Editar Prospecto</DialogTitle>
              <DialogDescription className="text-slate-600">
                Actualiza los datos clave de esta oportunidad sin perder el contexto comercial.
              </DialogDescription>
            </DialogHeader>
            <div className="grid flex-1 gap-5 overflow-y-auto px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-semibold text-slate-700">Nombre del contacto *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Nombre del cliente"
                    className="h-11 border-slate-300"
                  />
                  {errors.name && (
                    <p className="text-sm font-medium text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company" className="font-semibold text-slate-700">Empresa o negocio</Label>
                  <Input
                    id="company"
                    {...register("company")}
                    placeholder="Nombre de la empresa"
                    className="h-11 border-slate-300"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-semibold text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="email@ejemplo.com"
                    className="h-11 border-slate-300"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-semibold text-slate-700">Teléfono / WhatsApp</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+57 300 123 4567"
                    className="h-11 border-slate-300"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                <div className="grid gap-2">
                  <Label htmlFor="projectType" className="font-semibold text-slate-700">Necesidad o proyecto *</Label>
                  <Input
                    id="projectType"
                    {...register("projectType")}
                    placeholder="Ej: Sitio web, Aplicación móvil"
                    className="h-11 border-slate-300"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="font-semibold text-slate-700">Estado</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || lead.status} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11 border-slate-300">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">Nuevo</SelectItem>
                          <SelectItem value="CONTACTED">Contactado</SelectItem>
                          <SelectItem value="DIAGNOSIS">En Diagnóstico</SelectItem>
                          <SelectItem value="PROPOSAL_SENT">Propuesta Enviada</SelectItem>
                          <SelectItem value="NEGOTIATION">Negociación</SelectItem>
                          <SelectItem value="CLIENT">Cliente</SelectItem>
                          <SelectItem value="DISCARDED">Descartado</SelectItem>
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
                  placeholder="Describe las necesidades del cliente"
                  className="min-h-[110px] resize-none border-slate-300"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="clientBudget" className="flex items-center gap-2 font-semibold text-slate-700">
                    Presupuesto del Cliente
                    {formCurrency === "USD" && (
                      <span className="text-[10px] font-normal text-slate-400">
                        (1 USD ≈ $4.200 COP)
                      </span>
                    )}
                  </Label>
                  <Controller
                    name="clientBudget"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="clientBudget"
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        currency={formCurrency}
                        showCurrencyToggle
                        onCurrencyChange={(c) => {
                          const currentVal = getValues("clientBudget")
                          if (currentVal) {
                            if (c === "USD" && formCurrency === "COP") {
                              setValue("clientBudget", Math.round(currentVal / USD_TO_COP))
                            } else if (c === "COP" && formCurrency === "USD") {
                              setValue("clientBudget", Math.round(currentVal * USD_TO_COP))
                            }
                          }
                          setFormCurrency(c)
                        }}
                        placeholder={formCurrency === "COP" ? "5.000.000" : "5,000"}
                        className="h-11 border-slate-300"
                      />
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes" className="font-semibold text-slate-700">Notas Internas</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Notas adicionales sobre el prospecto"
                    className="min-h-[72px] resize-none border-slate-300"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 bg-white px-6 py-4 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="h-11 border-slate-300"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-11 bg-emerald-700 hover:bg-emerald-800">
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-slate-200 sm:max-w-[460px]">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl">Eliminar prospecto</DialogTitle>
            <DialogDescription className="text-slate-500">
              Esta acción no se puede deshacer. El prospecto será eliminado
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="border-slate-200">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
