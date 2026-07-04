<div align="center">
  <img src="https://raw.githubusercontent.com/Erick-000/ClientePotencialAI/main/public/logo.png" alt="ClientePotencial AI" width="120" />

  <h1>ClientePotencial AI</h1>
  <p>Mini CRM inteligente con análisis de IA para freelancers, agencias y equipos comerciales</p>

  ![CI – Validación del proyecto](https://img.shields.io/badge/CI-passing-success)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?logo=postgresql)](https://www.prisma.io/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ¿Qué es ClientePotencial AI?

ClientePotencial AI es un CRM ligero con análisis de IA para freelancers, desarrolladores, pequeñas agencias y equipos comerciales que necesitan convertir conversaciones con posibles clientes en oportunidades claras, priorizadas y listas para seguimiento.

La aplicación permite registrar prospectos, controlar el estado del pipeline, estimar presupuestos en COP, analizar complejidad/riesgo con OpenAI y generar mensajes comerciales sugeridos.

---

## Características principales

- 🏠 Landing page profesional con acceso directo a dashboard y prospectos.
- 📊 Dashboard con métricas, distribución por estados, prioridades y oportunidades recientes.
- ✅ CRUD completo de prospectos.
- 🔍 Buscador, filtros avanzados y paginación en la lista de oportunidades.
- 🗂️ Vista Kanban del pipeline con drag & drop.
- 📋 Historial de actividades por prospecto.
- ⏰ Recordatorios de seguimiento.
- 📤 Exportación a CSV.
- 🤖 Análisis con IA para prioridad, complejidad, riesgo, presupuesto, alcance y mensaje sugerido.
- 💾 Persistencia con PostgreSQL y Prisma ORM.
- 📱 Interfaz responsive construida con Tailwind CSS y componentes tipo shadcn/ui.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 |
| UI | Tailwind CSS + Radix UI |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL |
| IA | OpenAI API (GPT-4o) |
| Formularios | React Hook Form + Zod |
| Gráficas | Recharts |
| Iconos | Lucide React |
| Drag & Drop | @dnd-kit |
| Testing E2E | Playwright |

---

## Requisitos

- Node.js 20 o superior.
- PostgreSQL disponible localmente o en un proveedor externo (Supabase, Railway, Neon, etc.).
- API key de OpenAI para usar el análisis inteligente.

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# OpenAI
OPENAI_API_KEY="sk-..."

# NextAuth (auth de usuarios)
NEXTAUTH_SECRET="tu_secreto_seguro_aqui" # Genera uno con: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"     # En producción será la URL de tu app (ej. https://tu-dominio.vercel.app)
```

---

## Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Erick-000/ClientePotencialAI.git
cd ClientePotencialAI

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores reales

# 4. Ejecutar migraciones de base de datos
npx prisma migrate dev

# 5. (Opcional) Cargar datos de demostración
npx prisma db seed

# 6. Iniciar el servidor de desarrollo
npm run dev
```

Abre la aplicación en: **http://localhost:3000**

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run start        # Iniciar en producción
npm run lint         # Verificar código
npm run test:e2e     # Pruebas end-to-end con Playwright
```

---

## 🚀 Cómo hacer Hosting (Vercel + Neon)

Esta es la combinación recomendada: **Vercel** para el servidor Next.js (y la API) y **Neon** para tu base de datos PostgreSQL Serverless. Render también es una alternativa para backend pero con Next.js + Vercel ya tienes cubierta el API.

### Paso 1 — Crear base de datos en Neon

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta gratuita.
2. Haz clic en **Create Project**.
3. Elige un nombre para el proyecto (ej. `clientepotencial-db`) y una región.
4. Una vez creado, Neon te mostrará un panel de Dashboard. Copia la cadena de conexión (`Connection string`) que luce así:
   ```
   postgresql://usuario:contraseña@ep-flat-water-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Guarda esa URL — la usarás como `DATABASE_URL` en Vercel.

En tu máquina local, con la URL de Neon como `DATABASE_URL`:

```bash
# Temporalmente apunta a Neon
DATABASE_URL="postgresql://usuario:..." npx prisma migrate deploy
```

O agrega la URL al `.env` y corre:

```bash
npx prisma migrate deploy
```

### Paso 3 — Subir el código a GitHub

```bash
git add .
git commit -m "feat: listo para producción"
git push origin main
```

### Paso 4 — Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta con tu GitHub.
2. Haz clic en **Add New → Project**.
3. Busca y selecciona `ClientePotencialAI`.
4. En la sección **Environment Variables**, agrega:

   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | La URL de Neon del Paso 1 |
   | `OPENAI_API_KEY` | Tu clave de OpenAI |
   | `NEXTAUTH_SECRET` | Resultado de `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | La URL de tu proyecto en Vercel (ej: `https://clientepotencial.vercel.app`) |

5. Haz clic en **Deploy**.

### Paso 5 — Verificar

Vercel construirá y desplegará automáticamente. En 2–3 minutos tendrás tu URL pública. Cada `push` a `main` generará un nuevo deploy automático.

> **Alternativas de hosting:**
> - **Railway**: Incluye PostgreSQL + Next.js en un solo lugar — ideal si prefieres todo unificado.
> - **Render**: Alternativa gratuita con tiempo de inactividad en el plan free.
> - **Neon**: PostgreSQL serverless con plan gratuito generoso, funciona muy bien con Vercel.

---

## Estructura del proyecto

```text
app/
  api/                  Rutas API de prospectos, IA, actividades, recordatorios, exportación
  (auth)/               Páginas de autenticación (login)
  (dashboard)/
    dashboard/          Métricas y gráficas
    leads/              Lista, detalle e historial de prospectos
    kanban/             Vista Kanban del pipeline
  layout.tsx            Layout raíz con SessionProvider
  page.tsx              Landing page
components/
  layout/               Sidebar y header
  ui/                   Componentes reutilizables (shadcn/ui)
  activity-feed.tsx     Timeline de actividades
  kanban-board.tsx      Tablero Kanban con drag & drop
  reminders-widget.tsx  Widget de recordatorios pendientes
lib/
  openai.ts             Cliente de OpenAI
  prisma.ts             Cliente de Prisma
  validations.ts        Esquemas Zod
  auth.ts               Configuración NextAuth
prisma/
  schema.prisma         Modelo de datos (Lead, User, Activity, Reminder)
  seed.ts               Datos demo
types/
  index.ts              Tipos compartidos
e2e/
  leads.spec.ts         Pruebas E2E de prospectos
  dashboard.spec.ts     Pruebas E2E del dashboard
middleware.ts           Protección de rutas con NextAuth
playwright.config.ts    Configuración de Playwright
```

---

## Flujo de uso

1. Registra un prospecto con nombre, contacto, necesidad, estado y presupuesto aproximado.
2. Consulta la lista de prospectos — usa búsqueda, filtros por estado, presupuesto y fecha.
3. Visualiza el pipeline en vista Kanban y arrastra prospectos entre columnas.
4. Entra al detalle del prospecto y ejecuta el análisis con IA.
5. Revisa prioridad, complejidad, riesgo, presupuesto estimado, alcance y mensaje sugerido.
6. Registra actividades (llamadas, emails, reuniones) en el historial del prospecto.
7. Crea recordatorios de seguimiento para no perder oportunidades.
8. Exporta tu lista de prospectos a CSV para análisis externo.
9. Actualiza el estado del pipeline hasta propuesta, negociación, cliente o descarte.

---

## Análisis con IA

El endpoint `/api/ai/analyze-lead` usa OpenAI para generar un análisis estructurado en JSON. Si la clave no está configurada o el servidor no puede conectarse con OpenAI, la aplicación muestra un error claro y no guarda un análisis local falso.

Campos que devuelve el análisis:

- Prioridad y complejidad.
- Nivel de oportunidad y riesgo.
- Presupuesto mínimo, recomendado y máximo en COP.
- Tiempo estimado.
- Razón del análisis.
- Siguiente acción recomendada.
- Alcance incluido y fuera de alcance.
- Entregables.
- Mensaje comercial sugerido.

---

## Recomendaciones para producción

- Configurar todas las variables de entorno como secretos en Vercel/Railway.
- Usar la autenticación integrada antes de exponer el CRM a múltiples usuarios.
- Crear respaldos automáticos de PostgreSQL (Supabase lo hace por defecto en planes pagos).
- Activar observabilidad de errores (Sentry, Vercel Analytics).
- Correr `npm run test:e2e` antes de cada release importante.

---

## Roadmap

| Estado | Feature |
|--------|---------|
| ✅ Listo | CRUD de prospectos |
| ✅ Listo | Análisis con IA |
| ✅ Listo | Dashboard con métricas |
| ✅ Listo | Exportación CSV |
| ✅ Listo | Vista Kanban |
| ✅ Listo | Historial de actividades |
| ✅ Listo | Recordatorios de seguimiento |
| ✅ Listo | Filtros avanzados por presupuesto y fecha |
| ✅ Listo | Pruebas E2E con Playwright |
| 🔜 Próximo | Autenticación y roles |
| 🔜 Próximo | Plantillas de mensajes comerciales |
| 🔜 Próximo | Notificaciones por email |
| 🔜 Próximo | Integración con calendario |

---

## Licencia

MIT — ver [LICENSE](LICENSE)

---

<div align="center">
  Hecho con ❤️ para freelancers y equipos que quieren convertir más prospectos en clientes.
</div>
