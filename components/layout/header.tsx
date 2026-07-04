"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import Image from "next/image"

export function Header() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost">
              <Menu className="h-6 w-6 text-slate-700" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white shadow-sm">
            <Image src="/favicon.png" alt="ClientePotencial AI" width={26} height={26} className="h-6 w-6 object-contain" priority />
          </div>
          <span className="text-sm font-bold text-slate-900">
            ClientePotencial
          </span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>
    </div>
  )
}
