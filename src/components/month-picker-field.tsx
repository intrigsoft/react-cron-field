"use client"

import * as React from "react"
import { ChevronDown, Minus, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface SelectedMonth {
  type: "single" | "range"
  month: number // 1-12 or range start
  endMonth?: number // range end
  step?: number
}

interface MonthPickerFieldProps {
  value: string
  onChange: (v: string) => void
  label?: string
  placeholder?: string
  theme?: {
    baseColor?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

/* ---------- helpers ---------- */
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const CODE = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

const monthNameToNum = (s: string) => {
  const idx = CODE.indexOf(s.toUpperCase())
  return idx === -1 ? Number(s) : idx + 1
}
const monthNumToName = (n: number) => CODE[n - 1] ?? n.toString()

/* ---------- component ---------- */
export function MonthPickerField({ value, onChange, label, placeholder, theme = {
  baseColor: "bg-muted/30 dark:bg-muted/20",
  primaryColor: "bg-primary text-primary-foreground",
  secondaryColor: "bg-muted text-muted-foreground",
} }: MonthPickerFieldProps) {
  /* ---------- state ---------- */
  const [open, setOpen] = React.useState(false)
  const [sel, setSel] = React.useState<SelectedMonth[]>([])
  const [cur, setCur] = React.useState<SelectedMonth | null>(null)
  const [curStep, setCurStep] = React.useState("")
  const [inputStart, setInputStart] = React.useState("")
  const [inputEnd, setInputEnd] = React.useState("")
  const [rangeMode, setRangeMode] = React.useState(false)
  const [rangeStart, setRangeStart] = React.useState<number | null>(null)

  /* ---------- parse inbound value ---------- */
  React.useEffect(() => {
    parseValue(value)
  }, [value])

  function parseValue(v: string) {
    if (!v || v === "*") {
      reset()
      return
    }

    const out: SelectedMonth[] = []
    const parts = v.split(",")
    for (const partRaw of parts) {
      const part = partRaw.trim()
      // global step */n
      if (part.startsWith("*/")) {
        const st = Number(part.slice(2))
        if (!isNaN(st)) out.push({ type: "single", month: 1, step: st })
        continue
      }

      // ranges or singles, maybe with step
      const [base, stepStr] = part.split("/")
      const step = stepStr ? Number(stepStr) : undefined

      if (base.includes("-")) {
        const [a, b] = base.split("-")
        const mA = monthNameToNum(a)
        const mB = monthNameToNum(b)
        if (mA >= 1 && mA <= 12 && mB >= 1 && mB <= 12) out.push({ type: "range", month: mA, endMonth: mB, step })
      } else {
        const m = monthNameToNum(base)
        if (m >= 1 && m <= 12) out.push({ type: "single", month: m, step })
      }
    }

    setSel(out)
    if (out.length) {
      const f = out[0]
      setCur(f)
      setRangeMode(f.type === "range")
      setCurStep(f.step?.toString() || "")
      setInputStart(f.month.toString())
      setInputEnd(f.endMonth?.toString() || "")
    } else reset()

    function reset() {
      setSel([])
      setCur(null)
      setCurStep("")
      setInputStart("")
      setInputEnd("")
      setRangeMode(false)
      setRangeStart(null)
      onChange("*")
    }
  }

  /* ---------- helpers ---------- */
  const cronFromSel = (arr: SelectedMonth[]) => {
    if (!arr.length) return "*"
    return arr
      .map((it) => {
        if (it.type === "range") {
          const base = `${monthNumToName(it.month)}-${monthNumToName(it.endMonth!)}`
          return it.step ? `${base}/${it.step}` : base
        } else {
          const base = monthNumToName(it.month)
          return it.step ? `${base}/${it.step}` : base
        }
      })
      .join(",")
  }

  const applySel = (list: SelectedMonth[]) => {
    setSel(list)
    onChange(cronFromSel(list))
  }

  /* ---------- badge helpers ---------- */
  const badgeLabel = (m: SelectedMonth) => {
    if (m.type === "range") {
      return `${monthNumToName(m.month)}-${monthNumToName(m.endMonth!)}${m.step ? `/${m.step}` : ""}`
    }
    return `${monthNumToName(m.month)}${m.step ? `/${m.step}` : ""}`
  }

  /* ---------- grid click ---------- */
  function clickMonth(m: number) {
    if (rangeMode) {
      if (rangeStart === null) {
        setRangeStart(m)
        setInputStart(m.toString())
      } else {
        const a = Math.min(rangeStart, m),
          b = Math.max(rangeStart, m)
        const exists = sel.some((s) => s.type === "range" && s.month === a && s.endMonth === b)
        const next: SelectedMonth[] = exists
          ? sel.filter((s) => !(s.type === "range" && s.month === a && s.endMonth === b))
          : [...sel, { type: "range", month: a, endMonth: b }]

        applySel(next)
        setRangeStart(null)
      }
    } else {
      const exists = sel.some((s) => s.type === "single" && s.month === m)
      const next: SelectedMonth[] = exists
        ? sel.filter((s) => !(s.type === "single" && s.month === m))
        : [...sel, { type: "single", month: m }]

      applySel(next)
    }
  }

  const handleAddMonth = () => {
    const startMonth = Number.parseInt(inputStart)
    const endMonth = inputEnd ? Number.parseInt(inputEnd) : undefined
    const step = curStep ? Number.parseInt(curStep) : undefined

    if (isNaN(startMonth) || startMonth < 1 || startMonth > 12) return
    if (rangeMode && (isNaN(endMonth!) || endMonth! < 1 || endMonth! > 12)) return

    let newMonth: SelectedMonth
    if (rangeMode && endMonth !== undefined) {
      const start = Math.min(startMonth, endMonth)
      const end = Math.max(startMonth, endMonth)
      newMonth = { type: "range", month: start, endMonth: end, step }
    } else {
      newMonth = { type: "single", month: startMonth, step }
    }

    // Check if this month already exists
    const exists = sel.some((m) => {
      if (m.type !== newMonth.type) return false
      if (m.type === "single" && newMonth.type === "single") {
        return m.month === newMonth.month && m.step === newMonth.step
      }
      if (m.type === "range" && newMonth.type === "range") {
        return m.month === newMonth.month && m.endMonth === newMonth.endMonth && m.step === newMonth.step
      }
      return false
    })

    if (!exists) {
      const newSel = [...sel, newMonth].sort((a, b) => a.month - b.month)
      applySel(newSel)
      setCur(newMonth)
    }
  }

  /* ---------- ui text ---------- */
  const display =
    sel.length === 0
      ? (placeholder ?? "Every month")
      : sel.length === 1
        ? badgeLabel(sel[0])
        : sel.length <= 3
          ? sel.map(badgeLabel).join(", ")
          : `${sel.length} months selected`

  const baseColorClass = theme?.baseColor || "bg-muted/30"
  const primaryColorClass = theme?.primaryColor || "bg-primary text-primary-foreground"
  const secondaryColorClass = theme?.secondaryColor || "bg-muted text-muted-foreground"

  /* ---------- rendering ---------- */
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between text-left font-normal bg-transparent">
            <span className="truncate">{display}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[380px] p-0" align="start">
          <div className="flex flex-col max-h-[450px]">
            {/* badges */}
            {sel.length > 0 && (
              <div className={`p-3 border-b ${baseColorClass}`}>
                <div className="flex flex-wrap gap-1">
                  {sel.map((s, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className={`flex items-center gap-1 hover:bg-muted cursor-pointer ${cur === s ? primaryColorClass : ""}`}
                      onClick={() => {
                        setCur(s)
                        setRangeMode(s.type === "range")
                        setInputStart(s.month.toString())
                        setInputEnd(s.endMonth?.toString() || "")
                        setCurStep(s.step?.toString() || "")
                      }}
                    >
                      {s.type === "range" && <Minus className="h-3 w-3" />}
                      <span>{badgeLabel(s)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(s)
                        }}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* main */}
            <div className="flex-1 p-3 flex flex-col">
              {/* header */}
              <div className="space-y-3 mb-3">
                <div className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Click to select months
                </div>

                {/* range toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Range Mode</Label>
                  <div className="flex rounded-md overflow-hidden border">
                    <button
                      className={`px-3 py-1 text-xs font-medium transition-colors ${!rangeMode ? primaryColorClass : `${secondaryColorClass} hover:bg-muted/80`}`}
                      onClick={() => {
                        setRangeMode(false)
                        setRangeStart(null)
                      }}
                    >
                      Single
                    </button>
                    <button
                      className={`px-3 py-1 text-xs font-medium transition-colors ${rangeMode ? primaryColorClass : `${secondaryColorClass} hover:bg-muted/80`}`}
                      onClick={() => {
                        setRangeMode(true)
                        setRangeStart(null)
                      }}
                    >
                      Range
                    </button>
                  </div>
                </div>

                {rangeMode && (
                  <div className={`text-xs text-muted-foreground p-2 rounded ${baseColorClass}`}>
                    {rangeStart === null
                      ? "Click first month to start range"
                      : `Range start: ${SHORT[rangeStart - 1]}. Click another month to finish.`}
                  </div>
                )}
              </div>

              {/* controls */}
              <div className={`space-y-2 p-2 rounded mb-3 ${baseColorClass}`}>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">{rangeMode ? "Start" : "Month"}</Label>
                    <Input
                      value={inputStart}
                      onChange={(e) => setInputStart(e.target.value)}
                      type="number"
                      min="1"
                      max="12"
                      className="h-7 text-xs"
                      placeholder="1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      value={inputEnd}
                      onChange={(e) => setInputEnd(e.target.value)}
                      type="number"
                      min="1"
                      max="12"
                      disabled={!rangeMode && !cur}
                      className="h-7 text-xs"
                      placeholder="12"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Step</Label>
                    <Input
                      value={curStep}
                      onChange={(e) => setCurStep(e.target.value)}
                      type="number"
                      min="1"
                      placeholder="None"
                      className="h-7 text-xs"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-transparent"
                    onClick={handleAddMonth}
                    disabled={!inputStart || (rangeMode && !inputEnd)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* grid */}
              <div className="flex-1 flex items-center justify-center">
                <MonthGrid sel={sel} onClick={clickMonth} rangeStart={rangeStart} rangeMode={rangeMode} theme={theme} />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  /* ---------- internal helpers ---------- */
  function handleRemove(m: SelectedMonth) {
    const next = sel.filter((s) => s !== m)
    applySel(next)
    if (cur === m) {
      setCur(null)
      setInputStart("")
      setInputEnd("")
      setCurStep("")
    }
  }
}

/* ---------- month grid ---------- */
function MonthGrid({
  sel,
  onClick,
  rangeStart,
  rangeMode,
  theme,
}: {
  sel: SelectedMonth[]
  onClick: (m: number) => void
  rangeStart: number | null
  rangeMode: boolean
  theme?: {
    baseColor?: string
    primaryColor?: string
    secondaryColor?: string
  }
}) {
  // helpers
  const isSelected = (m: number) =>
    sel.some((s) => (s.type === "single" ? s.month === m : m >= s.month && m <= s.endMonth!))
  const isPrimary = (m: number) =>
    sel.some((s) => (s.type === "single" && s.month === m && s.step) || (s.type === "range" && s.month === m && s.step))
  const isSecondary = (m: number) =>
    sel.some((s) => {
      if (!s.step) return false
      if (s.type === "single") {
        for (let i = s.month + s.step; i <= 12; i += s.step) if (i === m) return true
        return false
      }
      if (s.type === "range") {
        for (let i = s.month; i <= s.endMonth!; i += s.step) if (i === m) return true
      }
    })

  const baseColorClass = theme?.baseColor || "bg-muted/30"
  const primaryColorClass = theme?.primaryColor || "bg-primary text-primary-foreground"
  const secondaryColorClass = theme?.secondaryColor || "bg-primary/60 text-primary-foreground"

  return (
    <div className="w-full max-w-[280px] p-3 border rounded-lg bg-background">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
          const sel = isSelected(n)
          const pri = isPrimary(n)
          const sec = isSecondary(n)
          const start = rangeMode && rangeStart === n

          let cls =
            "h-10 flex items-center justify-center text-sm font-medium rounded cursor-pointer transition-all duration-150 border"

          if (sel) {
            if (pri) {
              cls += ` ${primaryColorClass} border-primary`
            } else if (sec) {
              cls += ` ${secondaryColorClass} border-primary/60`
            } else {
              cls += " bg-primary/70 text-primary-foreground border-primary/70"
            }
          } else {
            cls += ` ${baseColorClass} hover:bg-muted border-border`
          }

          if (start) cls += " ring-2 ring-ring ring-dashed animate-pulse"

          return (
            <button key={n} className={cls} onClick={() => onClick(n)}>
              {SHORT[n - 1]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
