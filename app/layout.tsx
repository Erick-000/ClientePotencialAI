import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { NextAuthProvider } from "@/components/providers/session-provider"

export const metadata: Metadata = {
  title: "ClientePotencial AI",
  description: "Mini CRM inteligente para freelancers y desarrolladores",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
