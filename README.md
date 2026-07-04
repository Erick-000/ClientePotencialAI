<div align="center">
  <img src="https://raw.githubusercontent.com/Erick-000/ClientePotencialAI/main/public/logo.png" alt="ClientePotencial AI" width="120" />

  <h1>ClientePotencial AI</h1>
  <p>Mini CRM inteligente, de código abierto y local-first con análisis de IA para freelancers, agencias y equipos comerciales</p>

  ![CI – Validación del proyecto](https://img.shields.io/badge/CI-passing-success)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?logo=postgresql)](https://www.prisma.io/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ¿Qué es ClientePotencial AI?

ClientePotencial AI es un CRM ligero con análisis de IA para freelancers, desarrolladores, pequeñas agencias y equipos comerciales que necesitan convertir conversaciones con posibles clientes en oportunidades claras, priorizadas y listas para seguimiento.

El proyecto es **código abierto y local-first**: no requiere que los usuarios creen una cuenta ni pasen por complicados sistemas de login. Los prospectos se aíslan de forma segura en tu propio dispositivo garantizando que accedes directamente a la acción apenas abres la aplicación, ideal para que cada miembro del equipo tenga su propio espacio aislado por dispositivo.

---

## Características principales

- 🏠 **Acceso Directo (Local-first):** Entra y empieza a trabajar sin login. Tu información se aísla de manera inteligente por dispositivo (`deviceId`).
- 📊 **Dashboard Integral:** Métricas, distribución por estados, prioridades y oportunidades recientes.
- ✅ **Gestión de Prospectos:** CRUD completo con soporte de presupuestos multidivisa (USD y COP).
- 🔍 **Buscador y Filtros Avanzados:** Filtrado por estado, prioridad, fecha de creación y rangos de presupuesto (con autoconversión de moneda y validación de fechas ilógicas).
- 🗂️ **Vista Kanban Interactiva:** Pipeline visual con _drag & drop_ y **persistencia real del orden en base de datos**.
- 📋 **Historial de Actividades:** Lleva seguimiento de cada cambio, llamada o email.
- ⏰ **Recordatorios de Seguimiento:** Que no se enfríen las ventas.
- 📤 **Exportación a CSV:** Para llevar la información donde quieras.
- 🤖 **Análisis con IA:** Prioridad, complejidad, riesgo, estimación presupuestal y mensajes comerciales con GPT-4o.
- 💾 **Persistencia Rápida:** Base de datos PostgreSQL alojada en la nube con Prisma ORM.
- 📱 **100% Responsive:** Interfaz moderna y construida para móviles y computadoras.

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
| Drag & Drop | @dnd-kit (Sortable + ArrayMove) |

---

## Requisitos

- Node.js 20 o superior.
- PostgreSQL disponible localmente o en un proveedor externo (Neon, Supabase, Railway, etc.).
- API key de OpenAI para usar el análisis inteligente.

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# OpenAI
OPENAI_API_KEY="sk-..."
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
# Edita .env con tu DATABASE_URL y OPENAI_API_KEY

# 4. Ejecutar migraciones de base de datos
npx prisma migrate dev

# 5. Iniciar el servidor de desarrollo
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
```

---

## 🚀 Despliegue en la Nube (Vercel + Neon)

Recomendamos **Vercel** para la aplicación y la API, junto con **Neon** para PostgreSQL Serverless.

1. Ve a [neon.tech](https://neon.tech) y crea tu proyecto.
2. Copia tu `DATABASE_URL` y ejecuta las migraciones para subir las tablas a producción:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
3. Importa el proyecto en [Vercel](https://vercel.com) y configura tus **Environment Variables** (`DATABASE_URL` y `OPENAI_API_KEY`).
4. ¡Despliega! Vercel construirá y lanzará automáticamente tu CRM de código abierto.

---

## Estructura del proyecto

```text
app/
  api/                  Rutas API (prospectos, reordenamiento, IA, exportación)
  (dashboard)/
    dashboard/          Métricas y gráficas
    leads/              Lista, detalle, filtros e historial de prospectos
    kanban/             Vista Kanban persistente del pipeline
  layout.tsx            Layout raíz 
  page.tsx              Landing page
components/
  layout/               Sidebar y header
  ui/                   Componentes UI (shadcn/ui y componentes personalizados)
  kanban-board.tsx      Tablero Kanban con drag & drop
prisma/
  schema.prisma         Modelos (Lead, User, Activity, Reminder) con el campo `order`
```

---

## Flujo de uso

1. Entra directo sin contraseñas (tu espacio queda resguardado para el dispositivo actual).
2. Registra un prospecto, ingresa su presupuesto en COP o USD.
3. Visualiza el pipeline en vista Kanban, reordena las tarjetas arrastrándolas al lugar exacto de prioridad que desees. 
4. Entra al detalle del prospecto y presiona **Analizar con IA** para recibir estimaciones y sugerencias automáticas.
5. Usa los filtros avanzados en la lista si tienes una cartera de prospectos amplia (filtrando por montos de inversión y fecha exacta).

---

## Análisis con IA

El endpoint `/api/ai/analyze-lead` usa OpenAI para generar un análisis estructurado en JSON. Devuelve de manera inteligente:
- Complejidad, Prioridad y Riesgo.
- Presupuesto recomendado.
- Siguiente acción recomendada y **Mensaje comercial sugerido** (listo para copiar y pegar a WhatsApp).

---

## Roadmap

| Estado | Feature |
|--------|---------|
| ✅ Listo | Eliminación de Login para acceso libre |
| ✅ Listo | Aislamiento de datos _local-first_ (`deviceId`) |
| ✅ Listo | Kanban optimizado en móviles y con persistencia DB |
| ✅ Listo | Soporte multidivisa (USD / COP) en filtros y creación |
| ✅ Listo | Filtros avanzados con validación estricta (Zod) |
| ✅ Listo | Análisis con IA y Exportación CSV |
| 🔜 Próximo | Sincronización optativa en la nube multi-dispositivo |
| 🔜 Próximo | Notificaciones y Webhooks (Email/Slack) |

---

## Licencia

MIT — ver [LICENSE](LICENSE)

---

<div align="center">
  Hecho con ❤️ para que nunca vuelvas a perder el seguimiento de una venta potencial.
</div>
