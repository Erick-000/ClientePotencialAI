'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Plus,
  ArrowRight,
  Target,
  ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { Lead } from '@prisma/client'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_COLORS = {
  NEW: '#3b82f6', // blue
  CONTACTED: '#6366f1', // indigo
  DIAGNOSIS: '#8b5cf6', // violet
  PROPOSAL_SENT: '#06b6d4', // cyan
  NEGOTIATION: '#0ea5e9', // sky
  CLIENT: '#22c55e', // green
  DISCARDED: '#ef4444', // red
}

const PRIORITY_COLORS = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#ef4444',
}

const STATUS_LABELS = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  DIAGNOSIS: 'En Diagnóstico',
  PROPOSAL_SENT: 'Propuesta Enviada',
  NEGOTIATION: 'Negociación',
  CLIENT: 'Cliente',
  DISCARDED: 'Descartado',
}

const PRIORITY_LABELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CO')}`
}

function ChartTooltip({
  active,
  payload,
  label,
  total,
  title,
}: {
  active?: boolean
  payload?: Array<{ value?: number; payload?: { color?: string; percent?: number; status?: string; priority?: string } }>
  label?: string
  total: number
  title: string
}) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  const value = Number(item.value || 0)
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  const displayLabel = label || item.payload?.status || item.payload?.priority || title

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.payload?.color || '#10b981' }} />
        <p className="font-bold text-slate-900">{displayLabel}</p>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {value} {value === 1 ? 'prospecto' : 'prospectos'} de {total} totales
      </p>
      <p className="text-sm font-semibold text-emerald-700">{percent}% del pipeline</p>
    </div>
  )
}

// Metrics Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  colorClass = 'text-blue-600',
  bgClass = 'bg-blue-50',
}: {
  title: string
  value: string | number
  icon: any
  subtitle?: string
  colorClass?: string
  bgClass?: string
}) {
  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
          </div>
          <div className={`${bgClass} p-3 rounded-2xl`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const totalLeads = leads.length
  const activeLeads = leads.filter(
    (l) => !['CLIENT', 'DISCARDED'].includes(l.status)
  ).length
  const proposalsSent = leads.filter((l) => l.status === 'PROPOSAL_SENT').length
  const clients = leads.filter((l) => l.status === 'CLIENT').length
  const pipelineValue = leads.reduce(
    (sum, lead) => sum + (lead.estimatedBudget || 0),
    0
  )
  const conversionRate = totalLeads > 0 ? Math.round((clients / totalLeads) * 100) : 0
  const averageBudget =
    leads.filter((l) => l.estimatedBudget).length > 0
      ? Math.round(
          leads
            .filter((l) => l.estimatedBudget)
            .reduce((sum, l) => sum + (l.estimatedBudget || 0), 0) /
            leads.filter((l) => l.estimatedBudget).length
        )
      : 0

  // Prepare data for charts
  const statusData = Object.entries(
    leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    status: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#888',
  }))

  const priorityData = Object.entries(
    leads.reduce((acc, lead) => {
      if (lead.priority) {
        acc[lead.priority] = (acc[lead.priority] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  ).map(([priority, count]) => ({
    priority: PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || priority,
    count,
    color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || '#888',
  }))

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-2 md:pt-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-5 w-80 rounded-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pt-2 md:pt-0">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Pulso comercial, estado del pipeline y siguientes oportunidades.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/leads">
            <Button variant="outline" className="border-slate-300 text-slate-800">
              <ClipboardList className="mr-2 h-4 w-4" />
              Ver Prospectos
            </Button>
          </Link>
          <Link href="/leads">
            <Button className="bg-emerald-700 text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Prospecto
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Prospectos"
          value={totalLeads}
          icon={Users}
          subtitle={totalLeads === 0 ? 'Aún no tienes prospectos' : `${activeLeads} activos`}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <MetricCard
          title="Prospectos Activos"
          value={activeLeads}
          icon={TrendingUp}
          subtitle={totalLeads === 0 ? 'Registra tu primer prospecto' : `${totalLeads - activeLeads} cerrados`}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <MetricCard
          title="Propuestas Enviadas"
          value={proposalsSent}
          icon={Target}
          subtitle="Esperando respuesta"
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
        <MetricCard
          title="Clientes Ganados"
          value={clients}
          icon={CheckCircle}
          subtitle={clients === 0 ? '¡Tu primer cliente está cerca!' : '¡Excelente trabajo!'}
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
        <MetricCard
          title="Valor en Pipeline"
          value={formatCurrency(pipelineValue)}
          icon={DollarSign}
          subtitle="COP"
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <MetricCard
          title="Conversión a Cliente"
          value={`${conversionRate}%`}
          icon={DollarSign}
          subtitle={totalLeads === 0 ? 'Sin datos todavía' : `${clients} de ${totalLeads} prospectos`}
          colorClass="text-pink-600"
          bgClass="bg-pink-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800">
              Prospectos por Estado
            </CardTitle>
            <CardDescription className="text-gray-500">
              Distribución actual de tu pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis
                    dataKey="status"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b' }}
                    tickMargin={10}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 8 }}
                    content={<ChartTooltip total={totalLeads} title="Estado" />}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} isAnimationActive={false}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">
                No hay datos suficientes
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800">
              Prioridades
            </CardTitle>
            <CardDescription className="text-gray-500">
              Clasificación de oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="priority"
                    isAnimationActive={false}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip total={totalLeads} title="Prioridad" />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-sm text-gray-600 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">
                No hay datos suficientes
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Prospects */}
      <Card className="border border-gray-100 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">
              Prospectos Recientes
            </CardTitle>
            <CardDescription className="text-gray-500">
              Últimos 5 prospectos agregados
            </CardDescription>
          </div>
          <Link href="/leads" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentLeads.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">
                      Nombre
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Proyecto
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">
                      Presupuesto
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => (window.location.href = `/leads/${lead.id}`)}
                    >
                      <TableCell className="font-medium text-gray-800">
                        {lead.name}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {lead.projectType}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            lead.status === 'NEW'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.status === 'CONTACTED'
                              ? 'bg-indigo-100 text-indigo-800'
                              : lead.status === 'DIAGNOSIS'
                              ? 'bg-violet-100 text-violet-800'
                              : lead.status === 'PROPOSAL_SENT'
                              ? 'bg-cyan-100 text-cyan-800'
                              : lead.status === 'NEGOTIATION'
                              ? 'bg-sky-100 text-sky-800'
                              : lead.status === 'CLIENT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                          variant="secondary"
                        >
                          {STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS] || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-700">
                        {lead.estimatedBudget
                          ? `$${lead.estimatedBudget.toLocaleString('es-CO')}`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Aún no tienes prospectos registrados
              </h3>
              <p className="text-gray-500 mb-6">
                Crea tu primer prospecto para empezar
              </p>
              <Link href="/leads">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Prospecto
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
