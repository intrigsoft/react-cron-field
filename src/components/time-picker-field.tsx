import * as React from "react"
import { ChevronDown, X, Clock, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { AnalogClockFace } from "@/components/analog-clock-face"
import { cn } from "@/lib/utils"

interface SelectedValue {
  type: "single" | "range"
  value: number // For single values or range start
  endValue?: number // For range end
  step?: number
}

interface TimePickerFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  max?: number
  placeholder?: string
  theme?: {
    baseColor?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

export function TimePickerField({
  value,
  onChange,
  label,
  max = 59,
  placeholder = "Any",
  theme = {
    baseColor: "bg-muted/30 dark:bg-muted/20",
    primaryColor: "bg-primary text-primary-foreground",
    secondaryColor: "bg-muted text-muted-foreground",
  },
}: TimePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<SelectedValue[]>([])
  const [currentSelection, setCurrentSelection] = React.useState<SelectedValue | null>(null)
  const [currentStep, setCurrentStep] = React.useState("")
  const [currentValueInput, setCurrentValueInput] = React.useState("")
  const [currentEndValueInput, setCurrentEndValueInput] = React.useState("")
  const [isRangeMode, setIsRangeMode] = React.useState(false)
  const [rangeStart, setRangeStart] = React.useState<number | null>(null)

  // Parse the cron value to extract selected values with steps and ranges
  React.useEffect(() => {
    if (!value || value === "*") {
      setSelectedValues([])
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentValueInput("")
      setCurrentEndValueInput("")
      setIsRangeMode(false)
      setRangeStart(null)
      return
    }

    const newSelectedValues: SelectedValue[] = []

    // Handle global step like */5 first
    if (value.startsWith("*/")) {
      const stepValue = Number.parseInt(value.slice(2))
      if (!isNaN(stepValue)) {
        newSelectedValues.push({ type: "single", value: 0, step: stepValue })
      }
    } else {
      // Handle comma-separated values which might include steps and ranges
      const parts = value.split(",")

      for (const part of parts) {
        if (part.includes("/")) {
          // Handle step values like 5/15
          const [baseValue, stepValue] = part.split("/")
          const step = Number.parseInt(stepValue)

          if (baseValue.includes("-")) {
            // Range with step like 10-20/5
            const [start, end] = baseValue.split("-").map((v) => Number.parseInt(v.trim()))
            if (!isNaN(start) && !isNaN(end) && !isNaN(step)) {
              newSelectedValues.push({ type: "range", value: start, endValue: end, step })
            }
          } else {
            // Single value with step
            const base = Number.parseInt(baseValue)
            if (!isNaN(base) && !isNaN(step)) {
              newSelectedValues.push({ type: "single", value: base, step })
            }
          }
        } else if (part.includes("-")) {
          // Handle range values like 10-20
          const [start, end] = part.split("-").map((v) => Number.parseInt(v.trim()))
          if (!isNaN(start) && !isNaN(end)) {
            newSelectedValues.push({ type: "range", value: start, endValue: end })
          }
        } else {
          // Handle single value
          const num = Number.parseInt(part.trim())
          if (!isNaN(num)) {
            newSelectedValues.push({ type: "single", value: num })
          }
        }
      }
    }

    setSelectedValues(newSelectedValues)

    // Set current selection to first item if exists
    if (newSelectedValues.length > 0) {
      setCurrentSelection(newSelectedValues[0])
      setCurrentStep(newSelectedValues[0].step?.toString() || "")
      setCurrentValueInput(newSelectedValues[0].value.toString())
      setCurrentEndValueInput(newSelectedValues[0].endValue?.toString() || "")
      setIsRangeMode(newSelectedValues[0].type === "range")
    }
  }, [value, max])

  // Generate cron value from selected values
  const generateCronValue = (values: SelectedValue[]) => {
    if (values.length === 0) return ""

    const parts: string[] = []

    for (const item of values) {
      if (item.type === "range" && item.endValue !== undefined) {
        const rangeStr = `${item.value}-${item.endValue}`
        if (item.step) {
          parts.push(`${rangeStr}/${item.step}`)
        } else {
          parts.push(rangeStr)
        }
      } else {
        // Single value
        if (item.step) {
          if (item.value === 0) {
            parts.push(`*/${item.step}`)
          } else {
            parts.push(`${item.value}/${item.step}`)
          }
        } else {
          parts.push(item.value.toString())
        }
      }
    }

    return parts.join(",")
  }

  const handleClockClick = (clickedValue: number) => {
    if (isRangeMode) {
      if (rangeStart === null) {
        // First click - set range start
        setRangeStart(clickedValue)
        setCurrentValueInput(clickedValue.toString())
      } else {
        // Second click - complete range
        const start = Math.min(rangeStart, clickedValue)
        const end = Math.max(rangeStart, clickedValue)

        // Check if this range already exists
        const existingIndex = selectedValues.findIndex(
          (v) => v.type === "range" && v.value === start && v.endValue === end,
        )

        let newValues: SelectedValue[]
        if (existingIndex >= 0) {
          // Remove existing range
          newValues = selectedValues.filter((_, index) => index !== existingIndex)
          setCurrentSelection(null)
          setCurrentStep("")
          setCurrentValueInput("")
          setCurrentEndValueInput("")
        } else {
          // Add new range
          const newRange: SelectedValue = { type: "range", value: start, endValue: end }
          newValues = [...selectedValues, newRange].sort((a, b) => a.value - b.value)
          setCurrentSelection(newRange)
          setCurrentStep("")
          setCurrentValueInput(start.toString())
          setCurrentEndValueInput(end.toString())
        }

        setSelectedValues(newValues)
        const cronValue = generateCronValue(newValues)
        onChange(cronValue)

        // Reset range selection
        setRangeStart(null)
      }
    } else {
      // Single value mode
      const existingIndex = selectedValues.findIndex((v) => v.type === "single" && v.value === clickedValue)

      let newValues: SelectedValue[]
      if (existingIndex >= 0) {
        // Remove existing value
        newValues = selectedValues.filter((_, index) => index !== existingIndex)
        setCurrentSelection(null)
        setCurrentStep("")
        setCurrentValueInput("")
        setCurrentEndValueInput("")
      } else {
        // Add new value
        const newValue: SelectedValue = { type: "single", value: clickedValue }
        newValues = [...selectedValues, newValue].sort((a, b) => a.value - b.value)
        setCurrentSelection(newValue)
        setCurrentStep("")
        setCurrentValueInput(clickedValue.toString())
        setCurrentEndValueInput("")
      }

      setSelectedValues(newValues)
      const cronValue = generateCronValue(newValues)
      onChange(cronValue)
    }
  }

  const handleValueSelect = (selectedValue: SelectedValue) => {
    setCurrentSelection(selectedValue)
    setCurrentStep(selectedValue.step?.toString() || "")
    setCurrentValueInput(selectedValue.value.toString())
    setCurrentEndValueInput(selectedValue.endValue?.toString() || "")
    setIsRangeMode(selectedValue.type === "range")
    setRangeStart(null) // Reset any pending range selection
  }

  const handleRemoveValue = (valueToRemove: SelectedValue) => {
    const newValues = selectedValues.filter((v) => {
      if (v.type === "single" && valueToRemove.type === "single") {
        return v.value !== valueToRemove.value
      } else if (v.type === "range" && valueToRemove.type === "range") {
        return !(v.value === valueToRemove.value && v.endValue === valueToRemove.endValue)
      }
      return true
    })

    setSelectedValues(newValues)

    if (currentSelection === valueToRemove) {
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentValueInput("")
      setCurrentEndValueInput("")
      setIsRangeMode(false)
      setRangeStart(null)
    }

    const cronValue = generateCronValue(newValues)
    onChange(cronValue)
  }

  const handleValueInputChange = (inputValue: string) => {
    setCurrentValueInput(inputValue)

    const newValue = Number.parseInt(inputValue)
    if (isNaN(newValue) || newValue < 0 || newValue > max) return

    if (currentSelection === null) return

    // Update the selected value
    const newValues = selectedValues.map((v) => {
      if (v === currentSelection) {
        return { ...v, value: newValue }
      }
      return v
    })

    setSelectedValues(newValues)
    setCurrentSelection({ ...currentSelection, value: newValue })

    const cronValue = generateCronValue(newValues)
    onChange(cronValue)
  }

  const handleEndValueInputChange = (inputValue: string) => {
    setCurrentEndValueInput(inputValue)

    const newEndValue = Number.parseInt(inputValue)
    if (isNaN(newEndValue) || newEndValue < 0 || newEndValue > max) return

    if (currentSelection === null || currentSelection.type !== "range") return

    // Update the selected range end value
    const newValues = selectedValues.map((v) => {
      if (v === currentSelection) {
        return { ...v, endValue: newEndValue }
      }
      return v
    })

    setSelectedValues(newValues)
    setCurrentSelection({ ...currentSelection, endValue: newEndValue })

    const cronValue = generateCronValue(newValues)
    onChange(cronValue)
  }

  const handleStepChange = (stepValue: string) => {
    setCurrentStep(stepValue)

    if (currentSelection === null) return

    const newValues = selectedValues.map((v) => {
      if (v === currentSelection) {
        const step = stepValue ? Number.parseInt(stepValue) : undefined
        return { ...v, step: isNaN(step!) ? undefined : step }
      }
      return v
    })

    setSelectedValues(newValues)
    const cronValue = generateCronValue(newValues)
    onChange(cronValue)
  }

  const handleRangeModeToggle = (enabled: boolean) => {
    setIsRangeMode(enabled)
    setRangeStart(null) // Reset any pending range selection

    // If switching to range mode and current selection is single, clear it
    if (enabled && currentSelection?.type === "single") {
      setCurrentSelection(null)
      setCurrentStep("")
      setCurrentValueInput("")
      setCurrentEndValueInput("")
    }
  }

  const handleAddValue = () => {
    const startValue = Number.parseInt(currentValueInput)
    const endValue = currentEndValueInput ? Number.parseInt(currentEndValueInput) : undefined
    const step = currentStep ? Number.parseInt(currentStep) : undefined

    if (isNaN(startValue) || startValue < 0 || startValue > max) return
    if (isRangeMode && (isNaN(endValue!) || endValue! < 0 || endValue! > max)) return

    let newValue: SelectedValue
    if (isRangeMode && endValue !== undefined) {
      const start = Math.min(startValue, endValue)
      const end = Math.max(startValue, endValue)
      newValue = { type: "range", value: start, endValue: end, step }
    } else {
      newValue = { type: "single", value: startValue, step }
    }

    // Check if this value already exists
    const exists = selectedValues.some((v) => {
      if (v.type !== newValue.type) return false
      if (v.type === "single" && newValue.type === "single") {
        return v.value === newValue.value && v.step === newValue.step
      }
      if (v.type === "range" && newValue.type === "range") {
        return v.value === newValue.value && v.endValue === newValue.endValue && v.step === newValue.step
      }
      return false
    })

    if (!exists) {
      const newValues = [...selectedValues, newValue].sort((a, b) => a.value - b.value)
      setSelectedValues(newValues)
      setCurrentSelection(newValue)
      const cronValue = generateCronValue(newValues)
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

    for (const item of selectedValues) {
      if (item.type === "single") {
        positions.selected.push(item.value)

        if (item.step) {
          positions.stepPrimary.push(item.value)

          // Calculate step replicas
          for (let i = item.value + item.step; i <= max; i += item.step) {
            positions.stepSecondary.push(i)
          }
        }
      } else if (item.type === "range" && item.endValue !== undefined) {
        positions.ranges.push({ start: item.value, end: item.endValue })

        if (item.step) {
          positions.rangeSteps.push({ start: item.value, end: item.endValue, step: item.step })

          // For ranges with steps, only highlight the step values within the range
          for (let i = item.value; i <= item.endValue; i += item.step) {
            positions.selected.push(i)
            if (i === item.value) {
              positions.stepPrimary.push(i)
            } else {
              positions.stepSecondary.push(i)
            }
          }
        } else {
          // For ranges without steps, highlight all values in range
          for (let i = item.value; i <= item.endValue; i++) {
            positions.selected.push(i)
          }
        }
      }
    }

    return positions
  }

  const visualPositions = getVisualPositions()
  const currentSelectedItem = selectedValues.find((v) => v === currentSelection)

  const displayValue =
    selectedValues.length === 0
      ? placeholder || "Any"
      : selectedValues.length === 1
        ? selectedValues[0].type === "range"
          ? selectedValues[0].step
            ? `${selectedValues[0].value}-${selectedValues[0].endValue}/${selectedValues[0].step}`
            : `${selectedValues[0].value}-${selectedValues[0].endValue}`
          : selectedValues[0].step
            ? `${selectedValues[0].value}/${selectedValues[0].step}`
            : selectedValues[0].value.toString()
        : selectedValues.length <= 3
          ? selectedValues
              .map((v) =>
                v.type === "range"
                  ? v.step
                    ? `${v.value}-${v.endValue}/${v.step}`
                    : `${v.value}-${v.endValue}`
                  : v.step
                    ? `${v.value}/${v.step}`
                    : v.value.toString(),
              )
              .join(", ")
          : `${selectedValues.length} values selected`

  // Calculate dynamic height based on content
  const badgesHeight = selectedValues.length > 0 ? 50 : 0 // Height for badges section
  const baseClockHeight = 220 // Clock size
  const headerHeight = 80 // Header section with range mode toggle
  const controlsHeight = 105 // Always show all controls
  const bottomMargin = 20 // Bottom margin
  const totalHeight = badgesHeight + baseClockHeight + headerHeight + controlsHeight + bottomMargin

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
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="flex flex-col" style={{ height: `${totalHeight}px` }}>
            {/* Selected values badges */}
            {selectedValues.length > 0 && (
              <div className={`p-3 border-b ${theme.baseColor}`}>
                <div className="flex flex-wrap gap-1">
                  {selectedValues.map((item, index) => (
                    <Badge
                      key={`${item.type}-${item.value}-${item.endValue}-${index}`}
                      variant="secondary"
                      className={cn(
                        "flex items-center gap-1 cursor-pointer hover:bg-muted",
                        currentSelection === item ? theme.primaryColor : ""
                      )}
                      onClick={() => handleValueSelect(item)}
                    >
                      <div className="flex items-center gap-1">
                        {item.type === "range" && <Minus className="h-3 w-3" />}
                        <span>
                          {item.type === "range" ? `${item.value}-${item.endValue}` : item.value}
                          {item.step && `/${item.step}`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveValue(item)
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
                  Click to select {label ? label.toLowerCase() : "value"}
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
                <div className={`text-xs text-muted-foreground p-2 rounded ${theme.baseColor}`}>
                  {rangeStart === null
                    ? "Click first value to start range selection"
                    : `Range start: ${rangeStart}. Click second value to complete range.`}
                </div>
              </div>

              {/* Always show controls */}
              <div className={`space-y-2 p-2 rounded mb-3 flex-shrink-0 ${theme.baseColor}`}>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">{isRangeMode ? "Start" : "Value"}</Label>
                    <Input
                      value={currentValueInput}
                      onChange={(e) => handleValueInputChange(e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                      min="0"
                      max={max}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      value={currentEndValueInput}
                      onChange={(e) => handleEndValueInputChange(e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                      min="0"
                      max={max}
                      placeholder="0"
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
                    onClick={handleAddValue}
                    disabled={!currentValueInput || (isRangeMode && !currentEndValueInput)}
                  >
                    Add
                  </Button>
                </div>
                {currentSelectedItem?.step && (
                  <div className="text-xs text-muted-foreground">
                    {currentSelection?.type === "range"
                      ? `Pattern: ${currentSelection.value}, ${currentSelection.value + currentSelectedItem.step}, ... within range ${currentSelection.value}-${currentSelection.endValue}`
                      : `Pattern: ${currentSelection?.value}, ${(currentSelection?.value || 0) + currentSelectedItem.step}, ${(currentSelection?.value || 0) + currentSelectedItem.step * 2}, ...`}
                  </div>
                )}
              </div>

              {/* Analog Clock face - fixed size container */}
              <div className="flex items-center justify-center flex-1">
                <AnalogClockFace
                  max={max}
                  selectedValues={visualPositions.selected}
                  stepPrimary={visualPositions.stepPrimary}
                  stepSecondary={visualPositions.stepSecondary}
                  ranges={visualPositions.ranges}
                  highlightedValue={currentSelection?.value || null}
                  onValueClick={handleClockClick}
                  rangeStart={rangeStart}
                  isRangeMode={isRangeMode}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
