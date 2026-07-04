import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Rutas que requieren autenticación estricta (ninguna por ahora)
const PROTECTED_PREFIXES: string[] = []

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isProtected && !token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificación de rol para operaciones destructivas (DELETE)
  if (req.method === "DELETE" && pathname.startsWith("/api") && token?.role !== "ADMIN") {
    return NextResponse.json({ error: "Se requieren permisos de administrador para eliminar" }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/kanban/:path*", "/api/:path*"],
}
