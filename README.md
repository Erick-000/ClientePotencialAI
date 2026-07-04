# ClientePotencial AI

ClientePotencial AI es un CRM ligero con análisis de IA para freelancers, desarrolladores, pequeñas agencias y equipos comerciales que necesitan convertir conversaciones con posibles clientes en oportunidades claras, priorizadas y listas para seguimiento.

La aplicación permite registrar prospectos, controlar el estado del pipeline, estimar presupuestos en COP, analizar complejidad/riesgo con OpenAI y generar mensajes comerciales sugeridos.

## Características principales

- Landing page profesional con acceso directo a dashboard y prospectos.
- Dashboard con métricas, distribución por estados, prioridades y oportunidades recientes.
- CRUD completo de prospectos.
- Buscador, filtros y paginación en la lista de oportunidades.
- Modales compactos con validación de formularios.
- Campo de presupuesto con formato automático en pesos colombianos.
- Análisis con IA para prioridad, complejidad, riesgo, presupuesto, alcance y mensaje sugerido.
- Persistencia con PostgreSQL y Prisma ORM.
- Interfaz responsive construida con Tailwind CSS y componentes tipo shadcn/ui.

## Stack técnico

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- OpenAI API
- React Hook Form
- Zod
- Recharts
- Radix UI
- Lucide React

## Requisitos

- Node.js 20 o superior recomendado.
- PostgreSQL disponible localmente o en un proveedor externo.
- API key de OpenAI para usar el análisis inteligente.

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
OPENAI_API_KEY="sk-..."
```

## Instalación local

```bash
npm install
```

Genera el cliente de Prisma:

```bash
npx prisma generate
```

Ejecuta migraciones:

```bash
npx prisma migrate dev
```

Carga datos de demostración:

```bash
npx prisma db seed
```

Inicia el servidor:

```bash
npm run dev
```

Abre la aplicación en:

```text
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Flujo de uso

1. Registra un prospecto con nombre, contacto, necesidad, estado y presupuesto aproximado.
2. Consulta la lista de prospectos para buscar, filtrar y revisar oportunidades.
3. Entra al detalle del prospecto y ejecuta el análisis con IA.
4. Revisa prioridad, complejidad, riesgo, presupuesto estimado, alcance y mensaje sugerido.
5. Actualiza el estado del pipeline hasta propuesta, negociación, cliente o descarte.

## Análisis con IA

El endpoint `/api/ai/analyze-lead` usa OpenAI para generar un análisis estructurado en JSON. Si la clave no está configurada o el servidor no puede conectarse con OpenAI, la aplicación muestra un error claro y no guarda un análisis local falso.

Campos que devuelve el análisis:

- Prioridad.
- Complejidad.
- Nivel de oportunidad.
- Nivel de riesgo.
- Presupuesto mínimo, recomendado y máximo en COP.
- Tiempo estimado.
- Razón del análisis.
- Siguiente acción recomendada.
- Alcance incluido.
- Fuera de alcance.
- Entregables.
- Mensaje comercial sugerido.

## Estructura del proyecto

```text
app/
  api/                Rutas API de prospectos e IA
  (dashboard)/        Dashboard, lista y detalle de prospectos
  page.tsx            Página principal
components/
  layout/             Sidebar y header
  ui/                 Componentes reutilizables
lib/
  openai.ts           Cliente de OpenAI
  prisma.ts           Cliente de Prisma
  validations.ts      Esquemas Zod
prisma/
  schema.prisma       Modelo de datos
  seed.ts             Datos demo
types/
  index.ts            Tipos compartidos
```

## Recomendaciones para producción

- Configurar `DATABASE_URL` y `OPENAI_API_KEY` como variables seguras del proveedor.
- Agregar autenticación antes de usarlo con datos reales de clientes.
- Crear respaldos automáticos de PostgreSQL.
- Activar observabilidad de errores para rutas API.
- Agregar pruebas para formularios, CRUD y análisis con IA.

## Próximas mejoras sugeridas

- Autenticación y roles.
- Historial de actividades por prospecto.
- Recordatorios de seguimiento.
- Exportación CSV o Excel.
- Plantillas de mensajes comerciales.
- Filtros por rango de presupuesto y fecha.
- Vista Kanban del pipeline.
- Pruebas end-to-end con Playwright.

## Publicación en GitHub

Repositorio sugerido:

```text
https://github.com/Erick-000/ClientePotencialAI
```

Comandos para subir un proyecto existente:

```bash
git init
git add .
git commit -m "Mejora interfaz principal y documentación del proyecto"
git branch -M main
git remote add origin https://github.com/Erick-000/ClientePotencialAI.git
git push -u origin main
```

## Texto sugerido para el commit

Título:

```text
Mejora interfaz principal y documentación del proyecto
```

Descripción:

```text
Se mejora el footer de la página principal con navegación, stack técnico, enlace al repositorio y próximos pasos del producto.

También se actualiza el README con una presentación profesional del proyecto, instrucciones de instalación, variables de entorno, flujo de uso, detalles del análisis con IA y recomendaciones para producción.
```

## Licencia

MIT
