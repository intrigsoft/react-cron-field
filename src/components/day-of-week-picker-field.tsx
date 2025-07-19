"use client"

import * as React from "react"
import { ChevronDown, Calendar, X, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface SelectedDayOfWeek {
  type: "single" | "range"
  day: number // 0-6 (Sunday=0, Monday=1, ..., Saturday=6)
  endDay?: number // For range end
  step?: number
  nthWeek?: number // For nth weekday of month (1-4)
}

interface DayOfWeekPickerFieldProps {
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

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const DAY_FULL_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Convert day name to number (0-6, Sunday=0)
const dayNameToNumber = (name: string): number => {
  const upperName = name.toUpperCase()
  const dayMap: { [key: string]: number } = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  }
  return dayMap[upperName] !== undefined ? dayMap[upperName] : Number.parseInt(name)
}

// Convert day number to name (0-6 -> SUN-SAT)
const dayNumberToName = (num: number): string => {
  return DAY_NAMES[num] || num.toString()
}

export function DayOfWeekPickerField({ 
  value, 
  onChange, 
  label, 
  placeholder, 
  theme = {
    baseColor: "bg-muted/30 dark:bg-muted/20",
    primaryColor: "bg-primary text-primary-foreground",
    secondaryColor: "bg-muted text-muted-foreground",
  }
}: DayOfWeekPickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDays, setSelectedDays] = React.useState<SelectedDayOfWeek[]>([])
  const [currentSelection, setCurrentSelection] = React.useState<SelectedDayOfWeek | null>(null)
  const [currentStep, setCurrentStep] = React.useState("")
  const [currentDayInput, setCurrentDayInput] = React.useState("")
  const [currentEndDayInput, setCurrentEndDayInput] = React.useState("")
  const [currentNthWeek, setCurrentNthWeek] = React.useState("")
  const [isRangeMode, setIsRangeMode] = React.useState(false)
  const [rangeStart, setRangeStart] = React.useState<number | null>(null)

  // Parse the cron value to extract selected days with steps and ranges
  React.useEffect(() => {
    if (!value || value === "*") {
      setSelectedDays([])
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentDayInput("")
      setCurrentEndDayInput("")
      setCurrentNthWeek("")
      setIsRangeMode(false)
      setRangeStart(null)
      return
    }

    const newSelectedDays: SelectedDayOfWeek[] = []

    // Handle global step like */2 first
    if (value.startsWith("*/")) {
      const stepValue = Number.parseInt(value.slice(2))
      if (!isNaN(stepValue)) {
        newSelectedDays.push({ type: "single", day: 0, step: stepValue })
      }
    } else {
      // Handle comma-separated values which might include steps and ranges
      const parts = value.split(",")

      for (const part of parts) {
        const trimmedPart = part.trim()

        // Handle nth weekday of month (e.g., MON#2, 1#3)
        if (trimmedPart.includes("#")) {
          const [dayPart, nthPart] = trimmedPart.split("#")
          const nthWeek = Number.parseInt(nthPart)
          const day = isNaN(Number(dayPart)) ? dayNameToNumber(dayPart) : Number.parseInt(dayPart)

          if (!isNaN(day) && !isNaN(nthWeek) && day >= 0 && day <= 6 && nthWeek >= 1 && nthWeek <= 4) {
            newSelectedDays.push({
              type: "single",
              day,
              nthWeek,
            })
          }
          continue
        }

        if (trimmedPart.includes("/")) {
          // Handle step values like 1/2 or MON/2
          const [baseValue, stepValue] = trimmedPart.split("/")
          const step = Number.parseInt(stepValue)

          if (baseValue.includes("-")) {
            // Range with step like 1-5/2 or MON-FRI/1
            const [start, end] = baseValue.split("-")
            const startNum = isNaN(Number(start)) ? dayNameToNumber(start) : Number.parseInt(start)
            const endNum = isNaN(Number(end)) ? dayNameToNumber(end) : Number.parseInt(end)

            if (
              !isNaN(startNum) &&
              !isNaN(endNum) &&
              !isNaN(step) &&
              startNum >= 0 &&
              startNum <= 6 &&
              endNum >= 0 &&
              endNum <= 6
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
            const base = isNaN(Number(baseValue)) ? dayNameToNumber(baseValue) : Number.parseInt(baseValue)
            if (!isNaN(base) && !isNaN(step) && base >= 0 && base <= 6) {
              newSelectedDays.push({
                type: "single",
                day: base,
                step,
              })
            }
          }
        } else if (trimmedPart.includes("-")) {
          // Handle range values like 1-5 or MON-FRI
          const [start, end] = trimmedPart.split("-")
          const startNum = isNaN(Number(start)) ? dayNameToNumber(start) : Number.parseInt(start)
          const endNum = isNaN(Number(end)) ? dayNameToNumber(end) : Number.parseInt(end)

          if (!isNaN(startNum) && !isNaN(endNum) && startNum >= 0 && startNum <= 6 && endNum >= 0 && endNum <= 6) {
            newSelectedDays.push({
              type: "range",
              day: startNum,
              endDay: endNum,
            })
          }
        } else {
          // Handle single value like 1 or MON
          const day = isNaN(Number(trimmedPart)) ? dayNameToNumber(trimmedPart) : Number.parseInt(trimmedPart)
          if (!isNaN(day) && day >= 0 && day <= 6) {
            newSelectedDays.push({
              type: "single",
              day,
            })
          }
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
      setCurrentNthWeek(newSelectedDays[0].nthWeek?.toString() || "")
      setIsRangeMode(newSelectedDays[0].type === "range")
    }
  }, [value])

  // Generate cron value from selected days
  const generateCronValue = (days: SelectedDayOfWeek[]) => {
    if (days.length === 0) return "*"

    const parts: string[] = []

    for (const item of days) {
      let cronPart = ""

      if (item.type === "range" && item.endDay !== undefined) {
        // Use day names for ranges
        const rangeStr = `${dayNumberToName(item.day)}-${dayNumberToName(item.endDay)}`
        cronPart = item.step ? `${rangeStr}/${item.step}` : rangeStr
      } else {
        // Single value
        if (item.nthWeek) {
          // nth weekday of month
          cronPart = `${dayNumberToName(item.day)}#${item.nthWeek}`
        } else if (item.step) {
          if (item.day === 0) {
            cronPart = `*/${item.step}`
          } else {
            cronPart = `${dayNumberToName(item.day)}/${item.step}`
          }
        } else {
          cronPart = dayNumberToName(item.day)
        }
      }

      parts.push(cronPart)
    }

    return parts.join(",")
  }

  const handleDayClick = (clickedDay: number) => {
    if (isRangeMode) {
      if (rangeStart === null) {
        // First click - set range start
        setRangeStart(clickedDay)
        setCurrentDayInput(clickedDay.toString())
      } else {
        // Second click - complete range
        const start = Math.min(rangeStart, clickedDay)
        const end = Math.max(rangeStart, clickedDay)

        // Check if this range already exists
        const existingIndex = selectedDays.findIndex((d) => d.type === "range" && d.day === start && d.endDay === end)

        let newDays: SelectedDayOfWeek[]
        if (existingIndex >= 0) {
          // Remove existing range
          newDays = selectedDays.filter((_, index) => index !== existingIndex)
          setCurrentSelection(null)
          setCurrentStep("")
          setCurrentDayInput("")
          setCurrentEndDayInput("")
          setCurrentNthWeek("")
        } else {
          // Add new range
          const newRange: SelectedDayOfWeek = { type: "range", day: start, endDay: end }
          newDays = [...selectedDays, newRange].sort((a, b) => a.day - b.day)
          setCurrentSelection(newRange)
          setCurrentStep("")
          setCurrentDayInput(start.toString())
          setCurrentEndDayInput(end.toString())
          setCurrentNthWeek("")
        }

        setSelectedDays(newDays)
        const cronValue = generateCronValue(newDays)
        onChange(cronValue)

        // Reset range selection
        setRangeStart(null)
      }
    } else {
      // Single value mode
      const existingIndex = selectedDays.findIndex((d) => d.type === "single" && d.day === clickedDay)

      let newDays: SelectedDayOfWeek[]
      if (existingIndex >= 0) {
        // Remove existing day
        newDays = selectedDays.filter((_, index) => index !== existingIndex)
        setCurrentSelection(null)
        setCurrentStep("")
        setCurrentDayInput("")
        setCurrentEndDayInput("")
        setCurrentNthWeek("")
      } else {
        // Add new day
        const newDay: SelectedDayOfWeek = { type: "single", day: clickedDay }
        newDays = [...selectedDays, newDay].sort((a, b) => a.day - b.day)
        setCurrentSelection(newDay)
        setCurrentStep("")
        setCurrentDayInput(clickedDay.toString())
        setCurrentEndDayInput("")
        setCurrentNthWeek("")
      }

      setSelectedDays(newDays)
      const cronValue = generateCronValue(newDays)
      onChange(cronValue)
    }
  }

  const handlePresetClick = (preset: "weekdays" | "weekends") => {
    let newDays: SelectedDayOfWeek[]

    if (preset === "weekdays") {
      // Monday to Friday (1-5)
      const weekdayRange: SelectedDayOfWeek = { type: "range", day: 1, endDay: 5 }

      // Check if weekdays range already exists
      const existingIndex = selectedDays.findIndex((d) => d.type === "range" && d.day === 1 && d.endDay === 5)

      if (existingIndex >= 0) {
        // Remove existing weekdays range
        newDays = selectedDays.filter((_, index) => index !== existingIndex)
        setCurrentSelection(null)
        setCurrentStep("")
        setCurrentDayInput("")
        setCurrentEndDayInput("")
        setCurrentNthWeek("")
      } else {
        // Add weekdays range
        newDays = [...selectedDays, weekdayRange].sort((a, b) => a.day - b.day)
        setCurrentSelection(weekdayRange)
        setCurrentStep("")
        setCurrentDayInput("1")
        setCurrentEndDayInput("5")
        setCurrentNthWeek("")
        setIsRangeMode(true)
      }
    } else {
      // Weekend: Saturday and Sunday (6,0)
      const saturdayExists = selectedDays.findIndex((d) => d.type === "single" && d.day === 6)
      const sundayExists = selectedDays.findIndex((d) => d.type === "single" && d.day === 0)

      if (saturdayExists >= 0 && sundayExists >= 0) {
        // Remove both weekend days
        newDays = selectedDays.filter((d) => !(d.type === "single" && (d.day === 0 || d.day === 6)))
        setCurrentSelection(null)
        setCurrentStep("")
        setCurrentDayInput("")
        setCurrentEndDayInput("")
        setCurrentNthWeek("")
      } else {
        // Add weekend days (remove existing ones first, then add both)
        const filteredDays = selectedDays.filter((d) => !(d.type === "single" && (d.day === 0 || d.day === 6)))
        const saturday: SelectedDayOfWeek = { type: "single", day: 6 }
        const sunday: SelectedDayOfWeek = { type: "single", day: 0 }
        newDays = [...filteredDays, sunday, saturday].sort((a, b) => a.day - b.day)
        setCurrentSelection(sunday)
        setCurrentStep("")
        setCurrentDayInput("0")
        setCurrentEndDayInput("")
        setCurrentNthWeek("")
        setIsRangeMode(false)
      }
    }

    setSelectedDays(newDays)
    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const handleDaySelect = (selectedDay: SelectedDayOfWeek) => {
    setCurrentSelection(selectedDay)
    setCurrentStep(selectedDay.step?.toString() || "")
    setCurrentDayInput(selectedDay.day.toString())
    setCurrentEndDayInput(selectedDay.endDay?.toString() || "")
    setCurrentNthWeek(selectedDay.nthWeek?.toString() || "")
    setIsRangeMode(selectedDay.type === "range")
    setRangeStart(null) // Reset any pending range selection
  }

  const handleRemoveDay = (dayToRemove: SelectedDayOfWeek) => {
    const newDays = selectedDays.filter((d) => {
      if (d.type === "single" && dayToRemove.type === "single") {
        return d.day !== dayToRemove.day
      } else if (d.type === "range" && dayToRemove.type === "range") {
        return !(d.day === dayToRemove.day && d.endDay === dayToRemove.endDay)
      }
      return true
    })

    setSelectedDays(newDays)

    if (currentSelection === dayToRemove) {
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentDayInput("")
      setCurrentEndDayInput("")
      setCurrentNthWeek("")
      setIsRangeMode(false)
      setRangeStart(null)
    }

    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const handleDayInputChange = (inputValue: string) => {
    setCurrentDayInput(inputValue)

    const newDay = Number.parseInt(inputValue)
    if (isNaN(newDay) || newDay < 0 || newDay > 6) return

    if (currentSelection === null) return

    // Update the selected day
    const newDays = selectedDays.map((d) => {
      if (d === currentSelection) {
        return { ...d, day: newDay }
      }
      return d
    })

    setSelectedDays(newDays)
    setCurrentSelection({ ...currentSelection, day: newDay })

    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const handleEndDayInputChange = (inputValue: string) => {
    setCurrentEndDayInput(inputValue)

    const newEndDay = Number.parseInt(inputValue)
    if (isNaN(newEndDay) || newEndDay < 0 || newEndDay > 6) return

    if (currentSelection === null || currentSelection.type !== "range") return

    // Update the selected range end day
    const newDays = selectedDays.map((d) => {
      if (d === currentSelection) {
        return { ...d, endDay: newEndDay }
      }
      return d
    })

    setSelectedDays(newDays)
    setCurrentSelection({ ...currentSelection, endDay: newEndDay })

    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const handleStepChange = (stepValue: string) => {
    setCurrentStep(stepValue)

    if (currentSelection === null) return

    const newDays = selectedDays.map((d) => {
      if (d === currentSelection) {
        const step = stepValue ? Number.parseInt(stepValue) : undefined
        return { ...d, step: isNaN(step!) ? undefined : step }
      }
      return d
    })

    setSelectedDays(newDays)
    setCurrentSelection((prev) => (prev ? { ...prev, step: stepValue ? Number.parseInt(stepValue) : undefined } : null))
    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const handleNthWeekChange = (nthValue: string) => {
    setCurrentNthWeek(nthValue)

    if (currentSelection === null || currentSelection.type !== "single") return

    const newDays = selectedDays.map((d) => {
      if (d === currentSelection) {
        const nthWeek = nthValue ? Number.parseInt(nthValue) : undefined
        return { ...d, nthWeek: isNaN(nthWeek!) ? undefined : nthWeek }
      }
      return d
    })

    setSelectedDays(newDays)
    setCurrentSelection((prev) =>
      prev ? { ...prev, nthWeek: nthValue ? Number.parseInt(nthValue) : undefined } : null,
    )
    const cronValue = generateCronValue(newDays)
    onChange(cronValue)
  }

  const handleRangeModeToggle = (enabled: boolean) => {
    setIsRangeMode(enabled)
    setRangeStart(null) // Reset any pending range selection

    // If switching to range mode and current selection is single, clear it
    if (enabled && currentSelection?.type === "single") {
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentDayInput("")
      setCurrentEndDayInput("")
      setCurrentNthWeek("")
    }
  }

  const handleAddDay = () => {
    const startDay = Number.parseInt(currentDayInput)
    const endDay = currentEndDayInput ? Number.parseInt(currentEndDayInput) : undefined
    const step = currentStep ? Number.parseInt(currentStep) : undefined
    const nthWeek = currentNthWeek ? Number.parseInt(currentNthWeek) : undefined

    if (isNaN(startDay) || startDay < 0 || startDay > 6) return
    if (isRangeMode && (isNaN(endDay!) || endDay! < 0 || endDay! > 6)) return
    if (nthWeek && (isNaN(nthWeek) || nthWeek < 1 || nthWeek > 4)) return

    let newDay: SelectedDayOfWeek
    if (isRangeMode && endDay !== undefined) {
      const start = Math.min(startDay, endDay)
      const end = Math.max(startDay, endDay)
      newDay = { type: "range", day: start, endDay: end, step }
    } else {
      newDay = { type: "single", day: startDay, step, nthWeek }
    }

    // Check if this day already exists
    const exists = selectedDays.some((d) => {
      if (d.type !== newDay.type) return false
      if (d.type === "single" && newDay.type === "single") {
        return d.day === newDay.day && d.step === newDay.step && d.nthWeek === newDay.nthWeek
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

  // Get all visual positions (including step replicas and ranges)
  const getVisualPositions = () => {
    const positions = {
      selected: [] as number[],
      stepPrimary: [] as number[],
      stepSecondary: [] as number[],
      ranges: [] as Array<{ start: number; end: number }>,
      rangeSteps: [] as Array<{ start: number; end: number; step: number }>,
    }

    for (const item of selectedDays) {
      if (item.type === "single") {
        positions.selected.push(item.day)

        if (item.step) {
          positions.stepPrimary.push(item.day)

          // Calculate step replicas (wrapping around the week)
          for (let i = item.day + item.step; i <= 6; i += item.step) {
            positions.stepSecondary.push(i)
          }
        }
      } else if (item.type === "range" && item.endDay !== undefined) {
        positions.ranges.push({ start: item.day, end: item.endDay })

        if (item.step) {
          positions.rangeSteps.push({
            start: item.day,
            end: item.endDay,
            step: item.step,
          })

          // For ranges with steps, only highlight the step values within the range
          for (let i = item.day; i <= item.endDay; i += item.step) {
            positions.selected.push(i)
            if (i === item.day) {
              positions.stepPrimary.push(i)
            } else {
              positions.stepSecondary.push(i)
            }
          }
        } else {
          // For ranges without steps, highlight all values in range
          for (let i = item.day; i <= item.endDay; i++) {
            positions.selected.push(i)
          }
        }
      }
    }

    return positions
  }

  const visualPositions = getVisualPositions()
  const currentSelectedItem = selectedDays.find((d) => d === currentSelection)

  // Check if weekdays or weekends are selected
  const hasWeekdays = selectedDays.some((d) => d.type === "range" && d.day === 1 && d.endDay === 5)
  const hasWeekends = selectedDays.filter((d) => d.type === "single" && (d.day === 0 || d.day === 6)).length === 2

  const displayValue =
    selectedDays.length === 0
      ? placeholder || "Every day"
      : selectedDays.length === 1
        ? selectedDays[0].type === "range"
          ? selectedDays[0].step
            ? `${dayNumberToName(selectedDays[0].day)}-${dayNumberToName(selectedDays[0].endDay!)}/${selectedDays[0].step}`
            : `${dayNumberToName(selectedDays[0].day)}-${dayNumberToName(selectedDays[0].endDay!)}`
          : selectedDays[0].nthWeek
            ? `${dayNumberToName(selectedDays[0].day)}#${selectedDays[0].nthWeek}`
            : selectedDays[0].step
              ? `${dayNumberToName(selectedDays[0].day)}/${selectedDays[0].step}`
              : dayNumberToName(selectedDays[0].day)
        : selectedDays.length <= 3
          ? selectedDays
              .map((d) =>
                d.type === "range"
                  ? d.step
                    ? `${dayNumberToName(d.day)}-${dayNumberToName(d.endDay!)}/${d.step}`
                    : `${dayNumberToName(d.day)}-${dayNumberToName(d.endDay!)}`
                  : d.nthWeek
                    ? `${dayNumberToName(d.day)}#${d.nthWeek}`
                    : d.step
                      ? `${dayNumberToName(d.day)}/${d.step}`
                      : dayNumberToName(d.day),
              )
              .join(", ")
          : `${selectedDays.length} selections`

  const baseColorClass = theme?.baseColor || "bg-muted/30"
  const primaryColorClass = theme?.primaryColor || "bg-primary text-primary-foreground"
  const secondaryColorClass = theme?.secondaryColor || "bg-muted text-muted-foreground"

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal bg-transparent"
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <div className="flex flex-col max-h-[500px]">
            {/* Selected days badges */}
            {selectedDays.length > 0 && (
              <div className={`p-3 border-b ${baseColorClass}`}>
                <div className="flex flex-wrap gap-1">
                  {selectedDays.map((item, index) => (
                    <Badge
                      key={`${item.type}-${item.day}-${item.endDay}-${index}`}
                      variant="secondary"
                      className={`flex items-center gap-1 cursor-pointer hover:bg-muted ${
                        currentSelection === item ? primaryColorClass : ""
                      }`}
                      onClick={() => handleDaySelect(item)}
                    >
                      <div className="flex items-center gap-1">
                        {item.type === "range" && <Minus className="h-3 w-3" />}
                        <span>
                          {item.type === "range"
                            ? `${dayNumberToName(item.day)}-${dayNumberToName(item.endDay!)}`
                            : dayNumberToName(item.day)}
                          {item.nthWeek && `#${item.nthWeek}`}
                          {item.step && `/${item.step}`}
                        </span>
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

            {/* Right side - Timeline and controls */}
            <div className="p-3 flex flex-col pb-4">
              <div className="space-y-3 mb-3">
                <div className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Click to select days of week
                </div>

                {/* Range mode toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Range Mode</Label>
                  <div className="flex rounded-md overflow-hidden border">
                    <button
                      type="button"
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        !isRangeMode ? primaryColorClass : `${secondaryColorClass} hover:bg-muted/80`
                      }`}
                      onClick={() => handleRangeModeToggle(false)}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        isRangeMode ? primaryColorClass : `${secondaryColorClass} hover:bg-muted/80`
                      }`}
                      onClick={() => handleRangeModeToggle(true)}
                    >
                      Range
                    </button>
                  </div>
                </div>

                {/* Range instruction */}
                {isRangeMode && (
                  <div className={`text-xs text-muted-foreground p-2 rounded ${baseColorClass}`}>
                    {rangeStart === null
                      ? "Click first day to start range selection"
                      : `Range start: ${dayNumberToName(rangeStart)}. Click second day to complete range.`}
                  </div>
                )}
              </div>

              {/* Preset buttons */}
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant={hasWeekdays ? "default" : "outline"}
                  className="flex-1 h-8 text-xs bg-transparent"
                  onClick={() => handlePresetClick("weekdays")}
                >
                  Weekdays
                </Button>
                <Button
                  size="sm"
                  variant={hasWeekends ? "default" : "outline"}
                  className="flex-1 h-8 text-xs bg-transparent"
                  onClick={() => handlePresetClick("weekends")}
                >
                  Weekends
                </Button>
              </div>

              {/* Always show controls */}
              <div className={`space-y-2 p-2 rounded mb-3 flex-shrink-0 ${baseColorClass}`}>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">{isRangeMode ? "Start" : "Day"}</Label>
                    <Input
                      value={currentDayInput}
                      onChange={(e) => handleDayInputChange(e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      value={currentEndDayInput}
                      onChange={(e) => handleEndDayInputChange(e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="6"
                      disabled={!isRangeMode && !currentSelection}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Step</Label>
                    <Input
                      placeholder="None"
                      value={currentStep}
                      onChange={(e) => handleStepChange(e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                      min="1"
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

                {/* Nth weekday of month - only show when editing a single day entry */}
                {currentSelection && currentSelection.type === "single" && (
                  <div className="flex gap-2 items-end pt-2 border-t">
                    <div className="flex-1">
                      <Label className="text-xs">Nth Week of Month</Label>
                      <Input
                        value={currentNthWeek}
                        onChange={(e) => handleNthWeekChange(e.target.value)}
                        className="h-7 text-xs"
                        type="number"
                        min="1"
                        max="4"
                        placeholder="None"
                      />
                    </div>
                    <div className="flex-2 text-xs text-muted-foreground pt-2">
                      1=First, 2=Second, 3=Third, 4=Fourth week
                    </div>
                  </div>
                )}

                {currentSelection?.nthWeek && (
                  <div className="text-xs text-muted-foreground">
                    {currentSelection.nthWeek === 1 && "First"}
                    {currentSelection.nthWeek === 2 && "Second"}
                    {currentSelection.nthWeek === 3 && "Third"}
                    {currentSelection.nthWeek === 4 && "Fourth"} {DAY_FULL_NAMES[currentSelection.day]} of the month
                  </div>
                )}

                {currentSelectedItem?.step && (
                  <div className="text-xs text-muted-foreground">
                    {currentSelection?.type === "range"
                      ? `Pattern: ${dayNumberToName(currentSelection.day)}, ${dayNumberToName(currentSelection.day + currentSelectedItem.step)}, ... within range ${dayNumberToName(currentSelection.day)}-${dayNumberToName(currentSelection.endDay!)}`
                      : `Pattern: ${dayNumberToName(currentSelection?.day || 0)}, ${dayNumberToName((currentSelection?.day || 0) + currentSelectedItem.step)}, ...`}
                  </div>
                )}
              </div>

              {/* Day buttons - replace the timeline */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-[380px]">
                  <div className="grid grid-cols-7 gap-2 p-3 border rounded-lg bg-background">
                    {Array.from({ length: 7 }, (_, i) => i).map((day) => {
                      const isSelected = visualPositions.selected.includes(day)
                      const isPrimaryStep = visualPositions.stepPrimary.includes(day)
                      const isSecondaryStep = visualPositions.stepSecondary.includes(day)
                      const isRangeStartDay = rangeStart === day
                      const isWeekend = day === 0 || day === 6
                      const hasNthWeek = selectedDays.some((d) => d.type === "single" && d.day === day && d.nthWeek)

                      let buttonClass =
                        "h-12 flex flex-col items-center justify-center text-xs font-medium rounded cursor-pointer transition-all duration-150 border relative"

                      if (isSelected) {
                        if (isPrimaryStep) {
                          buttonClass += ` ${primaryColorClass} border-primary`
                        } else if (isSecondaryStep) {
                          buttonClass += " bg-primary/70 text-primary-foreground border-primary/70"
                        } else {
                          buttonClass += " bg-primary/80 text-primary-foreground border-primary/80"
                        }
                      } else {
                        buttonClass += isWeekend
                          ? " bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:hover:bg-orange-900/40 dark:text-orange-300"
                          : ` ${baseColorClass} hover:bg-muted border-border`
                      }

                      if (isRangeStartDay && isRangeMode) {
                        buttonClass += " ring-2 ring-ring ring-dashed animate-pulse"
                      }

                      return (
                        <button key={day} className={buttonClass} onClick={() => handleDayClick(day)}>
                          <span className="text-xs font-bold">{DAY_NAMES[day]}</span>
                          <span className="text-xs opacity-75">{DAY_FULL_NAMES[day].slice(0, 3)}</span>
                          {hasNthWeek && (
                            <span className="absolute -top-1 -right-1 text-xs font-bold text-blue-600">
                              #{selectedDays.find((d) => d.type === "single" && d.day === day && d.nthWeek)?.nthWeek}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Range start indicator */}
                  {isRangeMode && rangeStart !== null && (
                    <div className="text-xs text-center text-muted-foreground mt-2">
                      Range start: <span className="font-medium text-primary">{DAY_FULL_NAMES[rangeStart]}</span>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted border" />
                      <span>Weekday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-50 border border-orange-200" />
                      <span className="text-orange-600">Weekend</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
