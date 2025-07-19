import * as React from "react"
import { ChevronDown, Calendar, X, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SelectedDay {
  type: "single" | "range" | "last" | "weekday" | "lastWeekday"
  day: number
  endDay?: number
  step?: number
  lastOffset?: number // For L-5 (5 days before last day)
  isWeekday?: boolean // For W suffix (nearest weekday)
}

interface DayPickerFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  theme?: {
    baseColor?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

export function DayPickerField({
  value,
  onChange,
  label,
  placeholder = "Any day",
  theme = {
    baseColor: "bg-muted/30 dark:bg-muted/20",
    primaryColor: "bg-primary text-primary-foreground",
    secondaryColor: "bg-muted text-muted-foreground",
  },
}: DayPickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDays, setSelectedDays] = React.useState<SelectedDay[]>([])
  const [currentSelection, setCurrentSelection] = React.useState<SelectedDay | null>(null)
  const [currentStep, setCurrentStep] = React.useState("")
  const [currentDayInput, setCurrentDayInput] = React.useState("")
  const [currentEndDayInput, setCurrentEndDayInput] = React.useState("")
  const [isRangeMode, setIsRangeMode] = React.useState(false)
  const [rangeStart, setRangeStart] = React.useState<number | null>(null)

  // Parse the cron value to extract selected days
  React.useEffect(() => {
    if (!value || value === "*") {
      setSelectedDays([])
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentDayInput("")
      setCurrentEndDayInput("")
      setIsRangeMode(false)
      setRangeStart(null)
      return
    }

    const newSelectedDays: SelectedDay[] = []
    const parts = value.split(",")

    for (const part of parts) {
      const trimmedPart = part.trim()

      // Handle special cases
      if (trimmedPart === "L") {
        newSelectedDays.push({ type: "last", day: 31 })
        continue
      }

      if (trimmedPart === "LW") {
        newSelectedDays.push({ type: "lastWeekday", day: 31 })
        continue
      }

      if (trimmedPart.endsWith("W") && !trimmedPart.startsWith("L")) {
        const dayNum = Number.parseInt(trimmedPart.slice(0, -1))
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          newSelectedDays.push({ type: "single", day: dayNum, isWeekday: true })
        }
        continue
      }

      if (trimmedPart.startsWith("L-")) {
        const offset = Number.parseInt(trimmedPart.slice(2))
        if (!isNaN(offset)) {
          newSelectedDays.push({ type: "last", day: 31, lastOffset: offset })
        }
        continue
      }

      // Handle step values
      if (trimmedPart.includes("/")) {
        const [baseValue, stepValue] = trimmedPart.split("/")
        const step = Number.parseInt(stepValue)

        if (baseValue.includes("-")) {
          // Range with step
          const [start, end] = baseValue.split("-")
          const startNum = Number.parseInt(start)
          const endNum = Number.parseInt(end)

          if (
            !isNaN(startNum) &&
            !isNaN(endNum) &&
            !isNaN(step) &&
            startNum >= 1 &&
            startNum <= 31 &&
            endNum >= 1 &&
            endNum <= 31
          ) {
            newSelectedDays.push({
              type: "range",
              day: startNum,
              endDay: endNum,
              step,
            })
          }
        } else {
          // Single value with step
          const base = Number.parseInt(baseValue)
          if (!isNaN(base) && !isNaN(step) && base >= 1 && base <= 31) {
            newSelectedDays.push({
              type: "single",
              day: base,
              step,
            })
          }
        }
      } else if (trimmedPart.includes("-")) {
        // Range without step
        const [start, end] = trimmedPart.split("-")
        const startNum = Number.parseInt(start)
        const endNum = Number.parseInt(end)

        if (!isNaN(startNum) && !isNaN(endNum) && startNum >= 1 && startNum <= 31 && endNum >= 1 && endNum <= 31) {
          newSelectedDays.push({
            type: "range",
            day: startNum,
            endDay: endNum,
          })
        }
      } else {
        // Single value
        const day = Number.parseInt(trimmedPart)
        if (!isNaN(day) && day >= 1 && day <= 31) {
          newSelectedDays.push({
            type: "single",
            day,
          })
        }
      }
    }

    setSelectedDays(newSelectedDays)

    // Set current selection to first item if exists
    if (newSelectedDays.length > 0) {
      setCurrentSelection(newSelectedDays[0])
      setCurrentStep(newSelectedDays[0].step?.toString() || "")
      setCurrentDayInput(newSelectedDays[0].day.toString())
      setCurrentEndDayInput(newSelectedDays[0].endDay?.toString() || "")
      setIsRangeMode(newSelectedDays[0].type === "range")
    }
  }, [value])

  // Generate cron value from selected days
  const generateCronValue = (days: SelectedDay[]) => {
    if (days.length === 0) return ""

    const parts: string[] = []

    for (const item of days) {
      let cronPart = ""

      switch (item.type) {
        case "last":
          cronPart = item.lastOffset ? `L-${item.lastOffset}` : "L"
          break
        case "lastWeekday":
          cronPart = "LW"
          break
        case "weekday":
          cronPart = `${item.day}W`
          break
        case "range":
          if (item.endDay !== undefined) {
            const rangeStr = `${item.day}-${item.endDay}`
            cronPart = item.step ? `${rangeStr}/${item.step}` : rangeStr
          }
          break
        case "single":
          cronPart = item.step ? `${item.day}/${item.step}` : item.isWeekday ? `${item.day}W` : item.day.toString()
          break
      }

      if (cronPart) parts.push(cronPart)
    }

    return parts.join(",")
  }

  const handleDayClick = (clickedDay: number) => {
    if (isRangeMode) {
      if (rangeStart === null) {
        setRangeStart(clickedDay)
        setCurrentDayInput(clickedDay.toString())
      } else {
        const start = Math.min(rangeStart, clickedDay)
        const end = Math.max(rangeStart, clickedDay)

        const existingIndex = selectedDays.findIndex((d) => d.type === "range" && d.day === start && d.endDay === end)

        let newDays: SelectedDay[]
        if (existingIndex >= 0) {
          newDays = selectedDays.filter((_, index) => index !== existingIndex)
          setCurrentSelection(null)
          setCurrentStep("")
          setCurrentDayInput("")
          setCurrentEndDayInput("")
        } else {
          const newRange: SelectedDay = { type: "range", day: start, endDay: end }
          newDays = [...selectedDays, newRange].sort((a, b) => a.day - b.day)
          setCurrentSelection(newRange)
          setCurrentStep("")
          setCurrentDayInput(start.toString())
          setCurrentEndDayInput(end.toString())
        }

        setSelectedDays(newDays)
        const cronValue = generateCronValue(newDays)
        onChange(cronValue)
        setRangeStart(null)
      }
    } else {
      const existingIndex = selectedDays.findIndex((d) => d.type === "single" && d.day === clickedDay)

      let newDays: SelectedDay[]
      if (existingIndex >= 0) {
        newDays = selectedDays.filter((_, index) => index !== existingIndex)
        setCurrentSelection(null)
        setCurrentStep("")
        setCurrentDayInput("")
        setCurrentEndDayInput("")
      } else {
        // Add new day
        const newDay: SelectedDay = { type: "single", day: clickedDay }
        newDays = [...selectedDays, newDay].sort((a, b) => a.day - b.day)
        setCurrentSelection(newDay)
        setCurrentStep("")
        setCurrentDayInput(clickedDay.toString())
        setCurrentEndDayInput("")
      }

      setSelectedDays(newDays)
      const cronValue = generateCronValue(newDays)
      onChange(cronValue)
    }
  }

  const handleAddDay = () => {
    const startDay = Number.parseInt(currentDayInput)
    const endDay = currentEndDayInput ? Number.parseInt(currentEndDayInput) : undefined
    const step = currentStep ? Number.parseInt(currentStep) : undefined

    if (isNaN(startDay) || startDay < 1 || startDay > 31) return
    if (isRangeMode && (isNaN(endDay!) || endDay! < 1 || endDay! > 31)) return

    let newDay: SelectedDay
    if (isRangeMode && endDay !== undefined) {
      const start = Math.min(startDay, endDay)
      const end = Math.max(startDay, endDay)
      newDay = { type: "range", day: start, endDay: end, step }
    } else {
      newDay = { type: "single", day: startDay, step }
    }

    const exists = selectedDays.some((d) => {
      if (d.type !== newDay.type) return false
      if (d.type === "single" && newDay.type === "single") {
        return d.day === newDay.day && d.step === newDay.step
      }
      if (d.type === "range" && newDay.type === "range") {
        return d.day === newDay.day && d.endDay === newDay.endDay && d.step === newDay.step
      }
      return false
    })

    if (!exists) {
      const newDays = [...selectedDays, newDay].sort((a, b) => a.day - b.day)
      setSelectedDays(newDays)
      setCurrentSelection(newDay)
      const cronValue = generateCronValue(newDays)
      onChange(cronValue)
    }
  }

  const handleRemoveDay = (dayToRemove: SelectedDay) => {
    const newDays = selectedDays.filter((d) => d !== dayToRemove)
    setSelectedDays(newDays)

    if (currentSelection === dayToRemove) {
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentDayInput("")
      setCurrentEndDayInput("")
      setIsRangeMode(false)
      setRangeStart(null)
    }

    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const handleDaySelect = (selectedDay: SelectedDay) => {
    setCurrentSelection(selectedDay)
    setCurrentStep(selectedDay.step?.toString() || "")
    setCurrentDayInput(selectedDay.day.toString())
    setCurrentEndDayInput(selectedDay.endDay?.toString() || "")
    setIsRangeMode(selectedDay.type === "range")
    setRangeStart(null)
  }

  const handleWeekdayToggle = (enabled: boolean) => {
    if (!currentSelection || currentSelection.type !== "single") return

    const updatedSelection = { ...currentSelection, isWeekday: enabled }
    const newDays = selectedDays.map((d) => (d === currentSelection ? updatedSelection : d))

    setSelectedDays(newDays)
    setCurrentSelection(updatedSelection)
    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const badgeLabel = (day: SelectedDay) => {
    switch (day.type) {
      case "last":
        return day.lastOffset ? `L-${day.lastOffset}` : "L"
      case "lastWeekday":
        return "LW"
      case "weekday":
        return `${day.day}W`
      case "range":
        return `${day.day}-${day.endDay}${day.step ? `/${day.step}` : ""}`
      case "single":
        return `${day.day}${day.isWeekday ? "W" : ""}${day.step ? `/${day.step}` : ""}`
      default:
        return day.day.toString()
    }
  }

  const displayValue =
    selectedDays.length === 0
      ? placeholder || "Every day"
      : selectedDays.length === 1
        ? badgeLabel(selectedDays[0])
        : selectedDays.length <= 3
          ? selectedDays.map(badgeLabel).join(", ")
          : `${selectedDays.length} days selected`

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between text-left font-normal bg-transparent">
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <div className="flex flex-col max-h-[500px]">
            {/* Selected days badges */}
            {selectedDays.length > 0 && (
              <div className={`p-3 border-b ${theme.baseColor}`}>
                <div className="flex flex-wrap gap-1">
                  {selectedDays.map((item, index) => (
                    <Badge
                      key={`${item.type}-${item.day}-${item.endDay}-${index}`}
                      variant="secondary"
                      className={cn(
                        "flex items-center gap-1 cursor-pointer hover:bg-muted",
                        currentSelection === item ? theme.primaryColor : ""
                      )}
                      onClick={() => handleDaySelect(item)}
                    >
                      <div className="flex items-center gap-1">
                        {item.type === "range" && <Minus className="h-3 w-3" />}
                        <span>{badgeLabel(item)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveDay(item)
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

            <div className="p-3 flex flex-col">
              <div className="space-y-3 mb-3">
                <div className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Click to select days of month
                </div>

                {/* Range mode toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Range Mode</Label>
                  <div className="flex rounded-md overflow-hidden border">
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1 text-xs font-medium transition-colors",
                        !isRangeMode ? theme.primaryColor : `${theme.secondaryColor} hover:bg-muted/80`
                      )}
                      onClick={() => {
                        setIsRangeMode(false)
                        setRangeStart(null)
                      }}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1 text-xs font-medium transition-colors",
                        isRangeMode ? theme.primaryColor : `${theme.secondaryColor} hover:bg-muted/80`
                      )}
                      onClick={() => {
                        setIsRangeMode(true)
                        setRangeStart(null)
                      }}
                    >
                      Range
                    </button>
                  </div>
                </div>

                {isRangeMode && (
                  <div className={`text-xs text-muted-foreground p-2 rounded ${theme.baseColor}`}>
                    {rangeStart === null
                      ? "Click first day to start range"
                      : `Range start: ${rangeStart}. Click another day to finish.`}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className={`space-y-2 p-2 rounded mb-3 ${theme.baseColor}`}>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">{isRangeMode ? "Start" : "Day"}</Label>
                    <Input
                      value={currentDayInput}
                      onChange={(e) => setCurrentDayInput(e.target.value)}
                      type="number"
                      min="1"
                      max="31"
                      className="h-7 text-xs"
                      placeholder="1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      value={currentEndDayInput}
                      onChange={(e) => setCurrentEndDayInput(e.target.value)}
                      type="number"
                      min="1"
                      max="31"
                      disabled={!isRangeMode && !currentSelection}
                      className="h-7 text-xs"
                      placeholder="31"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Step</Label>
                    <Input
                      value={currentStep}
                      onChange={(e) => setCurrentStep(e.target.value)}
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
                    onClick={handleAddDay}
                    disabled={!currentDayInput || (isRangeMode && !currentEndDayInput)}
                  >
                    Add
                  </Button>
                </div>

                {/* Nearest Weekday toggle - only show when editing a single day entry */}
                {currentSelection && currentSelection.type === "single" && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Label className="text-xs">Nearest Weekday (W)</Label>
                    <div className="flex rounded-md overflow-hidden border">
                      <button
                        type="button"
                        className={cn(
                          "px-3 py-1 text-xs font-medium transition-colors",
                          !currentSelection.isWeekday ? theme.primaryColor : `${theme.secondaryColor} hover:bg-muted/80`
                        )}
                        onClick={() => handleWeekdayToggle(false)}
                      >
                        Off
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "px-3 py-1 text-xs font-medium transition-colors",
                          currentSelection.isWeekday ? theme.primaryColor : `${theme.secondaryColor} hover:bg-muted/80`
                        )}
                        onClick={() => handleWeekdayToggle(true)}
                      >
                        On
                      </button>
                    </div>
                  </div>
                )}

                {currentSelection?.isWeekday && (
                  <div className="text-xs text-muted-foreground">
                    If day {currentSelection.day} falls on a weekend, the trigger will fire on the nearest weekday.
                  </div>
                )}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1 p-2 border rounded-lg bg-background">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isSelected = selectedDays.some((d) => {
                    if (d.type === "single") return d.day === day
                    if (d.type === "range") return day >= d.day && day <= d.endDay!
                    return false
                  })

                  const isWeekdayDay =
                    isSelected && selectedDays.some((d) => d.type === "single" && d.day === day && d.isWeekday)

                  const isRangeStartDay = rangeStart === day

                  let buttonClass = cn(
                    "h-8 w-8 flex items-center justify-center text-xs font-medium rounded cursor-pointer transition-all duration-150 border relative",
                    isSelected ? `${theme.primaryColor} border-primary` : `${theme.baseColor} hover:bg-muted border-border`,
                    isRangeStartDay && "ring-2 ring-ring ring-dashed animate-pulse"
                  )

                  return (
                    <button key={day} className={buttonClass} onClick={() => handleDayClick(day)}>
                      {day}
                      {isWeekdayDay && (
                        <span className="absolute -top-1 -right-1 text-xs font-bold text-blue-600">W</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
