import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  DollarSign,
  Github,
  FileText,
  MessageSquareText,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const outcomes = [
  {
    icon: Users,
    title: "Pipeline limpio",
    text: "Cada prospecto queda con estado, presupuesto, prioridad, notas y siguiente acción.",
  },
  {
    icon: Sparkles,
    title: "Análisis accionable",
    text: "La IA resume oportunidad, riesgo, alcance, entregables y mensaje sugerido.",
  },
  {
    icon: DollarSign,
    title: "Presupuesto claro",
    text: "Compara presupuesto del cliente contra una estimación mínima, recomendada y máxima.",
  },
]

const steps = [
  "Registra el prospecto con datos mínimos.",
  "Analiza la oportunidad con IA cuando tengas contexto.",
  "Mueve el estado del pipeline hasta propuesta, negociación o cierre.",
]

const footerLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Prospectos", href: "/leads" },
  { label: "Flujo comercial", href: "#flujo" },
  { label: "Métricas", href: "#metricas" },
]

const footerStack = ["Next.js", "Prisma", "OpenAI", "PostgreSQL"]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-sm">
              <Image src="/favicon.png" alt="ClientePotencial AI" width={30} height={30} className="h-7 w-7 object-contain" priority />
            </span>
            <span className="text-lg font-bold">ClientePotencial AI</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#flujo" className="hover:text-slate-950">Flujo</a>
            <a href="#metricas" className="hover:text-slate-950">Métricas</a>
            <Link href="/leads" className="hover:text-slate-950">Prospectos</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="hidden rounded-full text-slate-700 hover:text-slate-950 sm:inline-flex">
                Dashboard
              </Button>
            </Link>
            <Link href="/leads">
              <Button className="rounded-full bg-emerald-700 px-5 text-white hover:bg-emerald-800">
                Crear prospecto
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            Convierte conversaciones comerciales en decisiones de venta.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Un CRM ligero para freelancers y equipos pequeños que necesitan capturar prospectos, estimar presupuestos, entender riesgos y dar seguimiento sin perder contexto.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/leads">
              <Button className="h-12 rounded-full bg-emerald-700 px-6 text-base text-white hover:bg-emerald-800">
                Empezar con prospectos
                <MousePointerClick className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="h-12 rounded-full border-slate-300 px-6 text-base text-slate-800">
                Ver métricas
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["3 min", "para registrar un lead"],
              ["5 estados", "para seguir el pipeline"],
              ["COP", "como moneda base"],
            ].map(([value, label]) => (
              <div key={label} className="border-l border-slate-200 pl-4">
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-100 p-3 shadow-2xl shadow-slate-200">
            <div className="rounded-[1.35rem] bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Vista de pipeline</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">Oportunidades activas</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">+18%</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Prospectos", "24", Users],
                  ["Pipeline", "$86M", DollarSign],
                  ["Cierres", "7", CheckCircle2],
                ].map(([label, value, Icon]) => (
                  <div key={label as string} className="rounded-2xl border border-slate-200 p-4">
                    <Icon className="h-5 w-5 text-emerald-700" />
                    <p className="mt-4 text-2xl font-bold text-slate-950">{value as string}</p>
                    <p className="text-sm text-slate-500">{label as string}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Clínica Aurora", "App de citas", "Alta", "Negociación"],
                  ["Muebles Norte", "Ecommerce", "Media", "Propuesta"],
                  ["Bistro Central", "Landing + reservas", "Baja", "Nuevo"],
                ].map(([name, project, priority, status]) => (
                  <div key={name} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1.2fr_1fr_auto_auto]">
                    <div>
                      <p className="font-bold text-slate-950">{name}</p>
                      <p className="text-sm text-slate-500">{project}</p>
                    </div>
                    <span className="hidden self-center text-sm text-slate-500 sm:block">Prioridad {priority}</span>
                    <span className="self-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{status}</span>
                    <ArrowRight className="self-center text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="flujo" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-normal text-slate-950">De lead frío a siguiente acción.</h2>
            <p className="mt-4 text-slate-600">
              La app está pensada para que cada registro termine en una decisión concreta, no en una lista abandonada.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="mt-5 font-semibold leading-7 text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="metricas" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {outcomes.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Icon className="h-6 w-6 text-emerald-700" />
                <h3 className="mt-5 text-xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-8 rounded-[2rem] border border-emerald-100 bg-emerald-50 p-8">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-normal text-slate-950">Mantén cada oportunidad lista para avanzar.</h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Revisa estados, prioridades, presupuestos y prospectos recientes sin perder la ruta hacia la siguiente acción comercial.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button className="h-11 rounded-full bg-emerald-700 px-5 text-white hover:bg-emerald-800">
                  Dashboard
                  <BarChart3 className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/leads">
                <Button variant="outline" className="h-11 rounded-full border-emerald-200 bg-white px-5 text-emerald-800 hover:bg-emerald-100">
                  Prospectos
                  <FileText className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white shadow-sm">
                <Image src="/favicon.png" alt="ClientePotencial AI" width={32} height={32} className="h-8 w-8 object-contain" />
              </span>
              <span>
                <span className="block text-lg font-bold">ClientePotencial AI</span>
                <span className="text-sm text-emerald-300">CRM comercial con análisis inteligente</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
              Diseñado para convertir conversaciones con posibles clientes en registros ordenados,
              presupuestos en COP, acciones claras y seguimiento comercial sin perder contexto.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                [ShieldCheck, "Datos claros"],
                [Database, "Prisma + PostgreSQL"],
                [Sparkles, "IA accionable"],
              ].map(([Icon, label]) => (
                <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
                  <Icon className="mb-3 h-5 w-5 text-emerald-300" />
                  {label as string}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Navegación</h2>
              <div className="mt-4 grid gap-3 text-sm">
                {footerLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-slate-300 transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Stack</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {footerStack.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <MessageSquareText className="h-4 w-4" />
              Proyecto listo para crecer
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Próximos pasos recomendados: autenticación, historial de actividades, exportación CSV,
              plantillas de mensajes y despliegue con variables seguras.
            </p>
            <a
              href="https://github.com/Erick-000/ClientePotencialAI"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-11 items-center rounded-full border border-white/10 bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-100"
            >
              <Github className="mr-2 h-4 w-4" />
              Ver repositorio
            </a>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 ClientePotencial AI. Todos los derechos reservados.</span>
          <span className="inline-flex items-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-300" />
            Hecho para equipos pequeños que venden con contexto.
          </span>
        </div>
      </footer>
    </main>
  )
}
