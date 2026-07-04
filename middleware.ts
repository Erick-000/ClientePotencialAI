import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación estricta (ninguna por ahora)
const PROTECTED_PREFIXES: string[] = []

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Asignar un deviceId único si el usuario no tiene uno
  let deviceId = req.cookies.get("deviceId")?.value
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    res.cookies.set("deviceId", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 año
    })
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
