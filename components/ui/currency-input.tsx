"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function formatCop(value?: number | null) {
  if (!value || Number.isNaN(value)) return ""
  return value.toLocaleString("es-CO", { maximumFractionDigits: 0 })
}

function parseCop(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return undefined
  return Number(digits)
}

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value?: number | null
  onValueChange?: (value: number | undefined) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, onBlur, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(formatCop(value))

    React.useEffect(() => {
      setDisplayValue(formatCop(value))
    }, [value])

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
          $
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={(event) => {
            const nextValue = parseCop(event.target.value)
            setDisplayValue(formatCop(nextValue))
            onValueChange?.(nextValue)
          }}
          onBlur={onBlur}
          className={cn(
            "flex h-10 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-7 pr-12 text-sm text-slate-950 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
            className
          )}
          {...props}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold tracking-[0.14em] text-slate-400">
          COP
        </span>
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
