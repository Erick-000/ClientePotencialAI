"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Currency = "COP" | "USD"

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatValue(value: number | undefined | null, currency: Currency) {
  if (value == null || Number.isNaN(value)) return ""
  if (currency === "USD") {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
  }
  return value.toLocaleString("es-CO", { maximumFractionDigits: 0 })
}

function parseValue(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return undefined
  return Number(digits)
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value?: number | null
  onValueChange?: (value: number | undefined) => void
  currency?: Currency
  onCurrencyChange?: (currency: Currency) => void
  showCurrencyToggle?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      className,
      value,
      onValueChange,
      onBlur,
      currency = "COP",
      onCurrencyChange,
      showCurrencyToggle = false,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(
      formatValue(value, currency)
    )

    // Sync external value changes
    React.useEffect(() => {
      setDisplayValue(formatValue(value, currency))
    }, [value, currency])

    const symbol = currency === "USD" ? "US$" : "$"

    return (
      <div className="relative flex items-center">
        {/* Currency symbol */}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 select-none">
          {symbol}
        </span>

        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={(e) => {
            const next = parseValue(e.target.value)
            setDisplayValue(formatValue(next, currency))
            onValueChange?.(next)
          }}
          onBlur={onBlur}
          className={cn(
            "flex h-10 w-full rounded-2xl border border-slate-200 bg-white py-2 text-sm text-slate-950 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
            showCurrencyToggle ? "pl-8 pr-24" : "pl-8 pr-14",
            className
          )}
          {...props}
        />

        {/* Right side: currency badge / toggle */}
        {showCurrencyToggle && onCurrencyChange ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-0.5">
            {(["COP", "USD"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCurrencyChange(c)}
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-widest transition-colors",
                  c === currency
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-[0.14em] text-slate-400 select-none">
            {currency}
          </span>
        )}
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
export type { Currency }
