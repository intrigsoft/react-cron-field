import * as React from "react"
import { ChevronDown, X, Clock, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { AnalogClockFace } from "@/components/analog-clock-face"
import { cn } from "@/lib/utils"

interface SelectedHour {
  type: "single" | "range"
  hour: number // 0-11 for 12-hour format (or range start)
  endHour?: number // For range end
  period: "AM" | "PM"
  step?: number
}

interface HourPickerFieldProps {
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

export function HourPickerField({
  value,
  onChange,
  label,
  placeholder = "Any hour",
  theme = {
    baseColor: "bg-muted/30 dark:bg-muted/20",
    primaryColor: "bg-primary text-primary-foreground",
    secondaryColor: "bg-muted text-muted-foreground",
  },
}: HourPickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedHours, setSelectedHours] = React.useState<SelectedHour[]>([])
  const [currentSelection, setCurrentSelection] = React.useState<SelectedHour | null>(null)
  const [currentStep, setCurrentStep] = React.useState("")
  const [currentHourInput, setCurrentHourInput] = React.useState("")
  const [currentPeriod, setCurrentPeriod] = React.useState<"AM" | "PM">("AM")
  const [viewMode, setViewMode] = React.useState<"AM" | "PM">("AM") // Controls which period is shown on clock
  const [isRangeMode, setIsRangeMode] = React.useState(false)
  const [rangeStart, setRangeStart] = React.useState<number | null>(null)
  const [currentEndHourInput, setCurrentEndHourInput] = React.useState("")

  // Convert 24-hour to 12-hour format
  const to12Hour = (hour24: number): { hour: number; period: "AM" | "PM" } => {
    if (hour24 === 0) return { hour: 12, period: "AM" }
    if (hour24 < 12) return { hour: hour24, period: "AM" }
    if (hour24 === 12) return { hour: 12, period: "PM" }
    return { hour: hour24 - 12, period: "PM" }
  }

  // Convert 12-hour to 24-hour format
  const to24Hour = (hour12: number, period: "AM" | "PM"): number => {
    if (period === "AM") {
      return hour12 === 12 ? 0 : hour12
    } else {
      return hour12 === 12 ? 12 : hour12 + 12
    }
  }

  // Parse the cron value to extract selected hours
  React.useEffect(() => {
    if (!value || value === "*") {
      setSelectedHours([])
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentHourInput("")
      setCurrentPeriod("AM")
      return
    }

    const newSelectedHours: SelectedHour[] = []

    // Handle global step like */2 first
    if (value.startsWith("*/")) {
      const stepValue = Number.parseInt(value.slice(2))
      if (!isNaN(stepValue)) {
        newSelectedHours.push({ type: "single", hour: 0, period: "AM", step: stepValue })
      }
    } else {
      // Handle comma-separated values which might include steps and ranges
      const parts = value.split(",")

      for (const part of parts) {
        if (part.includes("/")) {
          // Handle step values like 6/12
          const [baseValue, stepValue] = part.split("/")
          const step = Number.parseInt(stepValue)

          if (baseValue.includes("-")) {
            // Range with step like 9-17/2
            const [start, end] = baseValue.split("-").map((v) => Number.parseInt(v.trim()))
            if (!isNaN(start) && !isNaN(end) && !isNaN(step) && start >= 0 && start <= 23 && end >= 0 && end <= 23) {
              const { hour: startHour, period: startPeriod } = to12Hour(start)
              const { hour: endHour } = to12Hour(end)
              // For ranges spanning AM/PM, we'll use the start period
              newSelectedHours.push({
                type: "range",
                hour: startHour === 12 ? 0 : startHour % 12,
                endHour: endHour === 12 ? 0 : endHour % 12,
                period: startPeriod,
                step,
              })
            }
          } else {
            // Single value with step
            const base24 = Number.parseInt(baseValue)
            const step = Number.parseInt(stepValue)
            if (!isNaN(base24) && !isNaN(step) && base24 >= 0 && base24 <= 23) {
              const { hour, period } = to12Hour(base24)
              newSelectedHours.push({ type: "single", hour: hour === 12 ? 0 : hour % 12, period, step })
            }
          }
        } else if (part.includes("-")) {
          // Handle range values like 9-17
          const [start, end] = part.split("-").map((v) => Number.parseInt(v.trim()))
          if (!isNaN(start) && !isNaN(end) && start >= 0 && start <= 23 && end >= 0 && end <= 23) {
            const { hour: startHour, period: startPeriod } = to12Hour(start)
            const { hour: endHour } = to12Hour(end)
            // For ranges spanning AM/PM, we'll use the start period
            newSelectedHours.push({
              type: "range",
              hour: startHour === 12 ? 0 : startHour % 12,
              endHour: endHour === 12 ? 0 : endHour % 12,
              period: startPeriod,
            })
          }
        } else {
          // Handle single value
          const hour24 = Number.parseInt(part.trim())
          if (!isNaN(hour24) && hour24 >= 0 && hour24 <= 23) {
            const { hour, period } = to12Hour(hour24)
            newSelectedHours.push({ type: "single", hour: hour === 12 ? 0 : hour % 12, period })
          }
        }
      }
    }

    setSelectedHours(newSelectedHours)

    // Set current selection to first item if exists
    if (newSelectedHours.length > 0) {
      setCurrentSelection(newSelectedHours[0])
      setCurrentStep(newSelectedHours[0].step?.toString() || "")
      setCurrentHourInput((newSelectedHours[0].hour === 0 ? 12 : newSelectedHours[0].hour).toString())
      setCurrentEndHourInput(
        newSelectedHours[0].endHour
          ? (newSelectedHours[0].endHour === 0 ? 12 : newSelectedHours[0].endHour).toString()
          : "",
      )
      setCurrentPeriod(newSelectedHours[0].period)
      setViewMode(newSelectedHours[0].period)
      setIsRangeMode(newSelectedHours[0].type === "range")
    }
  }, [value])

  // Generate cron value from selected hours
  const generateCronValue = (hours: SelectedHour[]) => {
    if (hours.length === 0) return ""

    const parts: string[] = []

    for (const item of hours) {
      if (item.type === "range" && item.endHour !== undefined) {
        const start24 = to24Hour(item.hour === 0 ? 12 : item.hour, item.period)
        const end24 = to24Hour(item.endHour === 0 ? 12 : item.endHour, item.period)
        const rangeStr = `${start24}-${end24}`

        if (item.step) {
          parts.push(`${rangeStr}/${item.step}`)
        } else {
          parts.push(rangeStr)
        }
      } else {
        // Single value
        const hour24 = to24Hour(item.hour === 0 ? 12 : item.hour, item.period)

        if (item.step) {
          if (hour24 === 0) {
            parts.push(`*/${item.step}`)
          } else {
            parts.push(`${hour24}/${item.step}`)
          }
        } else {
          parts.push(hour24.toString())
        }
      }
    }

    return parts.join(",")
  }

  const handleClockClick = (clickedHour: number) => {
    const period = viewMode // Use current view mode

    if (isRangeMode) {
      if (rangeStart === null) {
        // First click - set range start
        setRangeStart(clickedHour)
        setCurrentHourInput((clickedHour === 0 ? 12 : clickedHour).toString())
      } else {
        // Second click - complete range
        const start = Math.min(rangeStart, clickedHour)
        const end = Math.max(rangeStart, clickedHour)

        // Check if this range already exists
        const existingIndex = selectedHours.findIndex(
          (h) => h.type === "range" && h.hour === start && h.endHour === end && h.period === period,
        )

        let newHours: SelectedHour[]
        if (existingIndex >= 0) {
          // Remove existing range
          newHours = selectedHours.filter((_, index) => index !== existingIndex)
          setCurrentSelection(null)
          setCurrentStep("")
          setCurrentHourInput("")
          setCurrentEndHourInput("")
          setCurrentPeriod("AM")
        } else {
          // Add new range
          const newRange: SelectedHour = { type: "range", hour: start, endHour: end, period }
          newHours = [...selectedHours, newRange].sort((a, b) => {
            const a24 = to24Hour(a.hour === 0 ? 12 : a.hour, a.period)
            const b24 = to24Hour(b.hour === 0 ? 12 : b.hour, b.period)
            return a24 - b24
          })
          setCurrentSelection(newRange)
          setCurrentStep("")
          setCurrentHourInput((start === 0 ? 12 : start).toString())
          setCurrentEndHourInput((end === 0 ? 12 : end).toString())
          setCurrentPeriod(period)
        }

        setSelectedHours(newHours)
        const cronValue = generateCronValue(newHours)
        onChange(cronValue)

        // Reset range selection
        setRangeStart(null)
      }
    } else {
      // Single value mode (existing logic)
      const existingIndex = selectedHours.findIndex(
        (h) => h.type === "single" && h.hour === clickedHour && h.period === period,
      )

      let newHours: SelectedHour[]
      if (existingIndex >= 0) {
        // Remove existing hour
        newHours = selectedHours.filter((_, index) => index !== existingIndex)
        setCurrentSelection(null)
        setCurrentStep("")
        setCurrentHourInput("")
        setCurrentEndHourInput("")
        setCurrentPeriod("AM")
      } else {
        // Add new hour
        const newHour: SelectedHour = { type: "single", hour: clickedHour, period }
        newHours = [...selectedHours, newHour].sort((a, b) => {
          const a24 = to24Hour(a.hour === 0 ? 12 : a.hour, a.period)
          const b24 = to24Hour(b.hour === 0 ? 12 : b.hour, b.period)
          return a24 - b24
        })
        setCurrentSelection(newHour)
        setCurrentStep("")
        setCurrentHourInput((clickedHour === 0 ? 12 : clickedHour).toString())
        setCurrentEndHourInput("")
        setCurrentPeriod(period)
      }

      setSelectedHours(newHours)
      const cronValue = generateCronValue(newHours)
      onChange(cronValue)
    }
  }

  const handleHourSelect = (selectedHour: SelectedHour) => {
    setCurrentSelection(selectedHour)
    setCurrentStep(selectedHour.step?.toString() || "")
    setCurrentHourInput((selectedHour.hour === 0 ? 12 : selectedHour.hour).toString())
    setCurrentEndHourInput(
      selectedHour.endHour ? (selectedHour.endHour === 0 ? 12 : selectedHour.endHour).toString() : "",
    )
    setCurrentPeriod(selectedHour.period)
    setViewMode(selectedHour.period)
    setIsRangeMode(selectedHour.type === "range")
    setRangeStart(null) // Reset any pending range selection
  }

  const handleRemoveHour = (hourToRemove: SelectedHour) => {
    const newHours = selectedHours.filter((h) => {
      if (h.type === "single" && hourToRemove.type === "single") {
        return !(h.hour === hourToRemove.hour && h.period === hourToRemove.period)
      } else if (h.type === "range" && hourToRemove.type === "range") {
        return !(h.hour === hourToRemove.hour && h.endHour === hourToRemove.endHour && h.period === hourToRemove.period)
      }
      return true
    })

    setSelectedHours(newHours)

    if (currentSelection === hourToRemove) {
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentHourInput("")
      setCurrentEndHourInput("")
      setCurrentPeriod("AM")
      setIsRangeMode(false)
      setRangeStart(null)
    }

    const cronValue = generateCronValue(newHours)
    onChange(cronValue)
  }

  const handleHourInputChange = (inputValue: string) => {
    setCurrentHourInput(inputValue)

    const newHour12 = Number.parseInt(inputValue)
    if (isNaN(newHour12) || newHour12 < 1 || newHour12 > 12) return

    if (currentSelection === null) return

    const newHour = newHour12 === 12 ? 0 : newHour12

    // Check if the new hour already exists (excluding current selection)
    const existingHour = selectedHours.find(
      (h) => h.hour === newHour && h.period === currentPeriod && h !== currentSelection, // Use object reference instead of property comparison
    )
    if (existingHour) return // Don't allow duplicates

    // Update the selected hour
    const newHours = selectedHours.map((h) => {
      if (h === currentSelection) {
        // Use object reference
        return { ...h, hour: newHour, period: currentPeriod }
      }
      return h
    })

    setSelectedHours(newHours)
    setCurrentSelection({ ...currentSelection, hour: newHour, period: currentPeriod })

    const cronValue = generateCronValue(newHours)
    onChange(cronValue)
  }

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setCurrentPeriod(newPeriod)
    setViewMode(newPeriod) // Also update view mode

    if (currentSelection === null) return

    // Check if the new period already exists (excluding current selection)
    const existingHour = selectedHours.find(
      (h) => h.hour === currentSelection.hour && h.period === newPeriod && h !== currentSelection, // Use object reference
    )
    if (existingHour) return // Don't allow duplicates

    // Update the selected hour
    const newHours = selectedHours.map((h) => {
      if (h === currentSelection) {
        // Use object reference
        return { ...h, period: newPeriod }
      }
      return h
    })

    setSelectedHours(newHours)
    setCurrentSelection({ ...currentSelection, period: newPeriod })

    const cronValue = generateCronValue(newHours)
    onChange(cronValue)
  }

  const handleStepChange = (stepValue: string) => {
    setCurrentStep(stepValue)

    if (currentSelection === null) return

    const newHours = selectedHours.map((h) => {
      if (h === currentSelection) {
        // Use object reference
        const step = stepValue ? Number.parseInt(stepValue) : undefined
        return { ...h, step: isNaN(step!) ? undefined : step }
      }
      return h
    })

    setSelectedHours(newHours)
    setCurrentSelection((prev) => (prev ? { ...prev, step: stepValue ? Number.parseInt(stepValue) : undefined } : null))
    const cronValue = generateCronValue(newHours)
    onChange(cronValue)
  }

  const handleRangeModeToggle = (enabled: boolean) => {
    setIsRangeMode(enabled)
    setRangeStart(null) // Reset any pending range selection

    // If switching to range mode and current selection is single, clear it
    if (enabled && currentSelection?.type === "single") {
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentHourInput("")
      setCurrentEndHourInput("")
      setCurrentPeriod("AM")
    }
  }

  const handleEndHourInputChange = (inputValue: string) => {
    setCurrentEndHourInput(inputValue)

    const newHour12 = Number.parseInt(inputValue)
    if (isNaN(newHour12) || newHour12 < 1 || newHour12 > 12) return

    if (currentSelection === null || currentSelection.type !== "range") return

    const newEndHour = newHour12 === 12 ? 0 : newHour12

    // Update the selected range end hour
    const newHours = selectedHours.map((h) => {
      if (h === currentSelection) {
        return { ...h, endHour: newEndHour }
      }
      return h
    })

    setSelectedHours(newHours)
    setCurrentSelection({ ...currentSelection, endHour: newEndHour })

    const cronValue = generateCronValue(newHours)
    onChange(cronValue)
  }

  const handleAddHour = () => {
    const startHour12 = Number.parseInt(currentHourInput)
    const endHour12 = currentEndHourInput ? Number.parseInt(currentEndHourInput) : undefined
    const step = currentStep ? Number.parseInt(currentStep) : undefined

    if (isNaN(startHour12) || startHour12 < 1 || startHour12 > 12) return
    if (isRangeMode && (isNaN(endHour12!) || endHour12! < 1 || endHour12! > 12)) return

    const startHour = startHour12 === 12 ? 0 : startHour12
    const endHour = endHour12 ? (endHour12 === 12 ? 0 : endHour12) : undefined

    let newHour: SelectedHour
    if (isRangeMode && endHour !== undefined) {
      const start = Math.min(startHour, endHour)
      const end = Math.max(startHour, endHour)
      newHour = { type: "range", hour: start, endHour: end, period: currentPeriod, step }
    } else {
      newHour = { type: "single", hour: startHour, period: currentPeriod, step }
    }

    // Check if this hour already exists
    const exists = selectedHours.some((h) => {
      if (h.type !== newHour.type) return false
      if (h.type === "single" && newHour.type === "single") {
        return h.hour === newHour.hour && h.period === newHour.period && h.step === newHour.step
      }
      if (h.type === "range" && newHour.type === "range") {
        return (
          h.hour === newHour.hour &&
          h.endHour === newHour.endHour &&
          h.period === newHour.period &&
          h.step === newHour.step
        )
      }
      return false
    })

    if (!exists) {
      const newHours = [...selectedHours, newHour].sort((a, b) => {
        const a24 = to24Hour(a.hour === 0 ? 12 : a.hour, a.period)
        const b24 = to24Hour(b.hour === 0 ? 12 : b.hour, b.period)
        return a24 - b24
      })
      setSelectedHours(newHours)
      setCurrentSelection(newHour)
      const cronValue = generateCronValue(newHours)
      onChange(cronValue)
    }
  }

  // Get visual positions for current view mode
  const getVisualPositions = () => {
    const positions = {
      selected: [] as number[],
      stepPrimary: [] as number[],
      stepSecondary: [] as number[],
      ranges: [] as Array<{ start: number; end: number }>,
      rangeSteps: [] as Array<{ start: number; end: number; step: number }>,
    }

    for (const item of selectedHours) {
      // Only show hours that match current view mode
      if (item.period === viewMode) {
        if (item.type === "single") {
          positions.selected.push(item.hour)

          if (item.step) {
            positions.stepPrimary.push(item.hour)

            // Calculate step replicas in 24-hour format
            const start24 = to24Hour(item.hour === 0 ? 12 : item.hour, item.period)
            for (let i = start24 + item.step; i <= 23; i += item.step) {
              const { hour, period } = to12Hour(i)
              if (period === viewMode) {
                positions.stepSecondary.push(hour === 12 ? 0 : hour % 12)
              }
            }
          }
        } else if (item.type === "range" && item.endHour !== undefined) {
          positions.ranges.push({ start: item.hour, end: item.endHour })

          if (item.step) {
            positions.rangeSteps.push({ start: item.hour, end: item.endHour, step: item.step })

            // For ranges with steps, only highlight the step values within the range
            const start24 = to24Hour(item.hour === 0 ? 12 : item.hour, item.period)
            const end24 = to24Hour(item.endHour === 0 ? 12 : item.endHour, item.period)

            for (let i = start24; i <= end24; i += item.step) {
              const { hour, period } = to12Hour(i)
              if (period === viewMode) {
                const hour12 = hour === 12 ? 0 : hour % 12
                positions.selected.push(hour12)
                if (i === start24) {
                  positions.stepPrimary.push(hour12)
                } else {
                  positions.stepSecondary.push(hour12)
                }
              }
            }
          } else {
            // For ranges without steps, highlight all values in range
            const start24 = to24Hour(item.hour === 0 ? 12 : item.hour, item.period)
            const end24 = to24Hour(item.endHour === 0 ? 12 : item.endHour, item.period)

            for (let i = start24; i <= end24; i++) {
              const { hour, period } = to12Hour(i)
              if (period === viewMode) {
                positions.selected.push(hour === 12 ? 0 : hour % 12)
              }
            }
          }
        }
      }
    }

    return positions
  }

  const visualPositions = getVisualPositions()
  const currentSelectedItem = selectedHours.find((h) => h === currentSelection) // Use object reference

  const displayValue =
    selectedHours.length === 0
      ? placeholder || "Any"
      : selectedHours.length === 1
        ? selectedHours[0].type === "range"
          ? selectedHours[0].step
            ? `${selectedHours[0].hour === 0 ? 12 : selectedHours[0].hour}-${selectedHours[0].endHour === 0 ? 12 : selectedHours[0].endHour}${selectedHours[0].period}/${selectedHours[0].step}`
            : `${selectedHours[0].hour === 0 ? 12 : selectedHours[0].hour}-${selectedHours[0].endHour === 0 ? 12 : selectedHours[0].endHour} ${selectedHours[0].period}`
          : selectedHours[0].step
            ? `${selectedHours[0].hour === 0 ? 12 : selectedHours[0].hour}${selectedHours[0].period}/${selectedHours[0].step}`
            : `${selectedHours[0].hour === 0 ? 12 : selectedHours[0].hour} ${selectedHours[0].period}`
        : selectedHours.length <= 3
          ? selectedHours
              .map((h) =>
                h.type === "range"
                  ? h.step
                    ? `${h.hour === 0 ? 12 : h.hour}-${h.endHour === 0 ? 12 : h.endHour}${h.period}/${h.step}`
                    : `${h.hour === 0 ? 12 : h.hour}-${h.endHour === 0 ? 12 : h.endHour} ${h.period}`
                  : h.step
                    ? `${h.hour === 0 ? 12 : h.hour}${h.period}/${h.step}`
                    : `${h.hour === 0 ? 12 : h.hour} ${h.period}`,
              )
              .join(", ")
          : `${selectedHours.length} hours selected`

  // Calculate dynamic height based on content
  const badgesHeight = selectedHours.length > 0 ? 50 : 0 // Height for badges section
  const baseClockHeight = 240 // Clock size
  const headerHeight = 80 // Header section with range mode toggle
  const controlsHeight = 105 // Always show all controls
  const switchHeight = 40 // AM/PM view switch
  const bottomMargin = 20 // Bottom margin
  const totalHeight = badgesHeight + baseClockHeight + headerHeight + controlsHeight + switchHeight + bottomMargin

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between text-left font-normal bg-transparent">
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <div className="flex flex-col" style={{ height: `${totalHeight}px` }}>
            {/* Selected hours badges */}
            {selectedHours.length > 0 && (
              <div className={`p-3 border-b ${theme.baseColor}`}>
                <div className="flex flex-wrap gap-1">
                  {selectedHours.map((item, index) => (
                    <Badge
                      key={`${item.type}-${item.hour}-${item.endHour}-${item.period}-${index}`}
                      variant="secondary"
                      className={cn(
                        "flex items-center gap-1 cursor-pointer hover:bg-muted",
                        currentSelection === item ? theme.primaryColor : ""
                      )}
                      onClick={() => handleHourSelect(item)}
                    >
                      <div className="flex items-center gap-1">
                        {item.type === "range" && <Minus className="h-3 w-3" />}
                        <span>
                          {item.type === "range"
                            ? `${item.hour === 0 ? 12 : item.hour}-${item.endHour === 0 ? 12 : item.endHour} ${item.period}`
                            : `${item.hour === 0 ? 12 : item.hour} ${item.period}`}
                          {item.step && `/${item.step}`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveHour(item)
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

            {/* Main content */}
            <div className="flex-1 p-3 flex flex-col pb-4">
              <div className="space-y-3 mb-3">
                <div className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Click to select hours
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
                      onClick={() => handleRangeModeToggle(false)}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1 text-xs font-medium transition-colors",
                        isRangeMode ? theme.primaryColor : `${theme.secondaryColor} hover:bg-muted/80`
                      )}
                      onClick={() => handleRangeModeToggle(true)}
                    >
                      Range
                    </button>
                  </div>
                </div>

                {/* Range instruction */}
                {isRangeMode && (
                  <div className={`text-xs text-muted-foreground p-2 rounded ${theme.baseColor}`}>
                    {rangeStart === null
                      ? "Click first hour to start range selection"
                      : `Range start: ${rangeStart === 0 ? 12 : rangeStart} ${viewMode}. Click second hour to complete range.`}
                  </div>
                )}
              </div>

              {/* Always show controls */}
              <div className={`space-y-2 p-2 rounded mb-3 flex-shrink-0 ${theme.baseColor}`}>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">{isRangeMode ? "Start" : "Hour"}</Label>
                    <Input
                      value={currentHourInput}
                      onChange={(e) => handleHourInputChange(e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                      min="1"
                      max="12"
                      placeholder="12"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      value={currentEndHourInput}
                      onChange={(e) => handleEndHourInputChange(e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                      min="1"
                      max="12"
                      placeholder="12"
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
                    onClick={handleAddHour}
                    disabled={!currentHourInput || (isRangeMode && !currentEndHourInput)}
                  >
                    Add
                  </Button>
                </div>

                {currentSelectedItem?.step && (
                  <div className="text-xs text-muted-foreground">
                    {currentSelection?.type === "range"
                      ? `Pattern: ${to24Hour(currentSelection.hour === 0 ? 12 : currentSelection.hour, currentSelection.period)}, ${to24Hour(currentSelection.hour === 0 ? 12 : currentSelection.hour, currentSelection.period) + currentSelectedItem.step}, ... within range`
                      : `Pattern: ${to24Hour(currentSelection?.hour === 0 ? 12 : currentSelection?.hour || 0, currentSelection?.period || "AM")}, ${to24Hour(currentSelection?.hour === 0 ? 12 : currentSelection?.hour || 0, currentSelection?.period || "AM") + currentSelectedItem.step}, ...`}
                  </div>
                )}
              </div>

              {/* Analog Clock face - fixed size container */}
              <div className="flex items-center justify-center flex-1">
                <AnalogClockFace
                  max={11}
                  selectedValues={visualPositions.selected}
                  stepPrimary={visualPositions.stepPrimary}
                  stepSecondary={visualPositions.stepSecondary}
                  ranges={visualPositions.ranges}
                  highlightedValue={
                    currentSelection && currentSelection.period === viewMode ? currentSelection.hour : null
                  }
                  onValueClick={handleClockClick}
                  rangeStart={rangeStart}
                  isRangeMode={isRangeMode}
                  is12Hour={true}
                  viewMode={viewMode}
                  theme={theme}
                />
              </div>

              {/* AM/PM View Mode Toggle */}
              <div className="flex items-center justify-center gap-2 pt-3 border-t">
                <span className="text-xs text-muted-foreground">View Mode</span>
                <div className="flex rounded-md overflow-hidden border">
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1 text-xs font-medium transition-colors",
                      viewMode === "AM" ? theme.primaryColor : `${theme.secondaryColor} hover:bg-muted/80`
                    )}
                    onClick={() => {
                      const newMode = "AM"
                      setViewMode(newMode)
                      if (currentSelection) {
                        handlePeriodChange(newMode)
                      }
                    }}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1 text-xs font-medium transition-colors",
                      viewMode === "PM" ? theme.primaryColor : `${theme.secondaryColor} hover:bg-muted/80`
                    )}
                    onClick={() => {
                      const newMode = "PM"
                      setViewMode(newMode)
                      if (currentSelection) {
                        handlePeriodChange(newMode)
                      }
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
