"use client"

import React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, AlertCircle, RotateCcw, Info, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TimePickerField } from "@/components/time-picker-field"
import { HourPickerField } from "@/components/hour-picker-field"
import { DayPickerField } from "@/components/day-picker-field"
import { MonthPickerField } from "@/components/month-picker-field"
import { DayOfWeekPickerField } from "@/components/day-of-week-picker-field"
import { Textarea } from "@/components/ui/textarea"
import {
  parseCronExpression,
  formatCronExpression,
  describeCronExpression,
  validateCronExpression,
  CRON_PRESETS,
  type CronExpression,
} from "@/lib/cron-utils"

interface FieldLabelWithInfoProps {
  label: string
  description: string
  children: React.ReactNode
}

function FieldLabelWithInfo({ label, description, children }: FieldLabelWithInfoProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label className="text-sm font-medium">{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted/50">
              <Info className="h-3 w-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm" side="top">
            <p>{description}</p>
          </PopoverContent>
        </Popover>
      </div>
      {children}
    </div>
  )
}

interface CronInputProps extends Omit<React.HTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string
  onChange?: (value: string) => void
  presets?: Array<{ label: string; value: string; description: string }>
  layout?: "cron-native" | "natural"
  promptToCron?: (prompt: string) => Promise<string>
  showSeconds?: boolean
  theme?: {
    baseColor?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

type DayMode = "everyday" | "dayOfWeek" | "dayOfMonth"

export const CronInput = React.forwardRef<HTMLInputElement, CronInputProps>(
  (
    {
      value = "0 0 * * * *",
      onChange,
      placeholder = "Select cron expression",
      presets = CRON_PRESETS,
      layout = "cron-native",
      promptToCron,
      showSeconds = true,
      theme = {
        baseColor: "bg-muted/30 dark:bg-muted/20",
        primaryColor: "bg-primary text-primary-foreground",
        secondaryColor: "bg-muted text-muted-foreground",
      },
      className,
      disabled,
      readOnly,
      ...inputProps
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState(presets.length > 0 ? "presets" : "builder")
    const [customExpression, setCustomExpression] = useState(value)
    const [formData, setFormData] = useState<CronExpression>(parseCronExpression(value))
    const [dayMode, setDayMode] = useState<DayMode>(() => {
      // Determine initial day mode based on current values
      const parsed = parseCronExpression(value)
      if (parsed.day !== "*" && parsed.day !== "" && parsed.dayOfWeek === "*") {
        return "dayOfMonth"
      } else if (parsed.dayOfWeek !== "*" && parsed.dayOfWeek !== "" && parsed.day === "*") {
        return "dayOfWeek"
      } else {
        return "everyday"
      }
    })

    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    const handleFormChange = (field: keyof CronExpression, fieldValue: string) => {
      const newFormData = { ...formData, [field]: fieldValue }

      // If showSeconds is false, always set seconds to "0"
      if (!showSeconds) {
        newFormData.second = "0"
      }

      setFormData(newFormData)
      const newExpression = formatCronExpression(newFormData)
      setCustomExpression(newExpression)
      onChange?.(newExpression)
    }

    const handleDayModeChange = (mode: DayMode) => {
      setDayMode(mode)

      const newFormData = { ...formData }

      switch (mode) {
        case "everyday":
          newFormData.day = "*"
          newFormData.dayOfWeek = "?"
          break
        case "dayOfWeek":
          newFormData.day = "?"
          // Keep existing dayOfWeek value or set to empty if it was "*"
          if (newFormData.dayOfWeek === "*" || newFormData.dayOfWeek === "?") {
            newFormData.dayOfWeek = ""
          }
          break
        case "dayOfMonth":
          newFormData.dayOfWeek = "?"
          // Keep existing day value or set to empty if it was "*"
          if (newFormData.day === "*" || newFormData.day === "?") {
            newFormData.day = ""
          }
          break
      }

      setFormData(newFormData)
      const newExpression = formatCronExpression(newFormData)
      setCustomExpression(newExpression)
      onChange?.(newExpression)
    }

    const handleCustomChange = (expression: string) => {
      setCustomExpression(expression)
      const parsed = parseCronExpression(expression)
      setFormData(parsed)

      // Update day mode based on parsed values
      if (parsed.day !== "*" && parsed.day !== "" && parsed.day !== "?" && parsed.dayOfWeek === "?") {
        setDayMode("dayOfMonth")
      } else if (
        parsed.dayOfWeek !== "*" &&
        parsed.dayOfWeek !== "" &&
        parsed.dayOfWeek !== "?" &&
        parsed.day === "?"
      ) {
        setDayMode("dayOfWeek")
      } else {
        setDayMode("everyday")
      }

      onChange?.(expression)
    }

    const handlePresetSelect = (preset: string) => {
      setCustomExpression(preset)
      const parsed = parseCronExpression(preset)
      setFormData(parsed)

      // Update day mode based on preset values
      if (parsed.day !== "*" && parsed.day !== "" && parsed.day !== "?" && parsed.dayOfWeek === "?") {
        setDayMode("dayOfMonth")
      } else if (
        parsed.dayOfWeek !== "*" &&
        parsed.dayOfWeek !== "" &&
        parsed.dayOfWeek !== "?" &&
        parsed.day === "?"
      ) {
        setDayMode("dayOfWeek")
      } else {
        setDayMode("everyday")
      }

      onChange?.(preset)
      setOpen(false)
    }

    const handleReset = () => {
      const resetExpression = "0 0 * * * *"
      setCustomExpression(resetExpression)
      setFormData(parseCronExpression(resetExpression))
      setDayMode("everyday")
      onChange?.(resetExpression)
    }

    const handlePromptSubmit = async () => {
      if (!prompt.trim() || isGenerating || !promptToCron) return

      setIsGenerating(true)
      try {
        const generatedExpression = await promptToCron(prompt.trim())
        setCustomExpression(generatedExpression)
        const parsed = parseCronExpression(generatedExpression)
        setFormData(parsed)

        // Update day mode based on generated values
        if (parsed.day !== "*" && parsed.day !== "" && parsed.day !== "?" && parsed.dayOfWeek === "?") {
          setDayMode("dayOfMonth")
        } else if (
          parsed.dayOfWeek !== "*" &&
          parsed.dayOfWeek !== "" &&
          parsed.dayOfWeek !== "?" &&
          parsed.day === "?"
        ) {
          setDayMode("dayOfWeek")
        } else {
          setDayMode("everyday")
        }

        onChange?.(generatedExpression)
        setPrompt("") // Clear the prompt after successful generation
      } catch (error) {
        console.error("Failed to generate cron expression:", error)
        // You could add error handling UI here
      } finally {
        setIsGenerating(false)
      }
    }

    const handlePromptKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handlePromptSubmit()
      }
    }

    const currentDescription = describeCronExpression(customExpression)
    const validation = validateCronExpression(customExpression)

    // Determine which tabs to show
    const showPresets = presets.length > 0
    const tabsConfig = []

    if (showPresets) {
      tabsConfig.push({ value: "presets", label: "Presets" })
    }
    tabsConfig.push({ value: "builder", label: "Builder" })
    tabsConfig.push({ value: "custom", label: "Custom Expression" })

    // Handle showSeconds prop changes
    useEffect(() => {
      if (!showSeconds && formData.second !== "0") {
        const newFormData = { ...formData, second: "0" }
        setFormData(newFormData)
        const newExpression = formatCronExpression(newFormData)
        setCustomExpression(newExpression)
        onChange?.(newExpression)
      }
    }, [showSeconds, formData, onChange])

    // Handle external value changes
    useEffect(() => {
      if (value !== customExpression) {
        setCustomExpression(value)
        const parsed = parseCronExpression(value)
        setFormData(parsed)

        // Update day mode based on new value
        if (parsed.day !== "*" && parsed.day !== "" && parsed.day !== "?" && parsed.dayOfWeek === "?") {
          setDayMode("dayOfMonth")
        } else if (
          parsed.dayOfWeek !== "*" &&
          parsed.dayOfWeek !== "" &&
          parsed.dayOfWeek !== "?" &&
          parsed.day === "?"
        ) {
          setDayMode("dayOfWeek")
        } else {
          setDayMode("everyday")
        }
      }
    }, [value, customExpression])

    const displayValue =
      validation.isValid && currentDescription !== "Invalid cron expression"
        ? currentDescription
        : customExpression || placeholder

    return (
      <Popover open={open && !disabled && !readOnly} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              {...inputProps}
              ref={ref}
              value={displayValue}
              readOnly
              className={`w-full pr-8 cursor-pointer bg-transparent ${
                !validation.isValid ? "border-destructive" : ""
              } ${className || ""}`}
              placeholder={placeholder}
              disabled={disabled}
              onClick={() => !disabled && !readOnly && setOpen(true)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !disabled && !readOnly) {
                  e.preventDefault()
                  setOpen(true)
                }
                inputProps.onKeyDown?.(e)
              }}
            />
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0" align="start">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${showPresets ? "grid-cols-3" : "grid-cols-2"} ${theme.baseColor}`}>
              {tabsConfig.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-4">
              {!validation.isValid && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validation.error}</AlertDescription>
                </Alert>
              )}

              {showPresets && (
                <TabsContent value="presets" className="mt-0 space-y-2 max-h-80 overflow-y-auto">
                  {presets.map((preset) => {
                    const presetDescription = describeCronExpression(preset.value)
                    return (
                      <Card
                        key={preset.value}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handlePresetSelect(preset.value)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <p className="font-medium">{preset.label}</p>
                              <p className="text-sm text-muted-foreground">{presetDescription}</p>
                            </div>
                            <code className={`text-xs ${theme.baseColor} px-2 py-1 rounded whitespace-nowrap`}>
                              {preset.value}
                            </code>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </TabsContent>
              )}

              <TabsContent value="builder" className="mt-0 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Schedule Configuration</h3>
                  <Button size="sm" variant="outline" onClick={handleReset} className="h-8 px-3 text-xs bg-transparent">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>

                {/* Conditional layout rendering based on layout prop */}
                {layout === "cron-native" ? (
                  // Cron-native layout: Second -> Minute -> Hour -> Day Component -> Day Field -> Month
                  <div className={`grid gap-4 ${showSeconds ? "grid-cols-3" : "grid-cols-2"}`}>
                    {showSeconds && (
                      <FieldLabelWithInfo
                        label="Second (0-59)"
                        description="Specifies the second within a minute when the job should execute. Use * for every second, specific numbers (0-59), ranges (10-20), or intervals (*/15 for every 15 seconds)."
                      >
                        <TimePickerField
                          value={formData.second}
                          onChange={(val) => handleFormChange("second", val)}
                          label=""
                          max={59}
                          placeholder="Any second"
                          theme={theme}
                        />
                      </FieldLabelWithInfo>
                    )}

                    <FieldLabelWithInfo
                      label="Minute (0-59)"
                      description="Specifies the minute within an hour when the job should execute. Use * for every minute, specific numbers (0-59), ranges (10-20), or intervals (*/15 for every 15 minutes)."
                    >
                      <TimePickerField
                        value={formData.minute}
                        onChange={(val) => handleFormChange("minute", val)}
                        label=""
                        max={59}
                        placeholder="Any minute"
                        theme={theme}
                      />
                    </FieldLabelWithInfo>

                    <FieldLabelWithInfo
                      label="Hour (12-hour format)"
                      description="Specifies the hour when the job should execute. Supports 12-hour format with AM/PM selection. Use * for every hour, specific hours, ranges, or intervals."
                    >
                      <HourPickerField
                        value={formData.hour}
                        onChange={(val) => handleFormChange("hour", val)}
                        label=""
                        placeholder="Any hour"
                        theme={theme}
                      />
                    </FieldLabelWithInfo>

                    <div className={showSeconds ? "col-span-2" : "col-span-1"}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Label className="text-sm font-medium">Day</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted/50">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 text-sm" side="top">
                                <p>
                                  Choose how to specify when the job runs: Every Day (ignores day restrictions), Day of
                                  Week (specific weekdays like Monday-Friday), or Day of Month (specific dates like 1st,
                                  15th).
                                </p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex rounded-md overflow-hidden border">
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-medium transition-colors ${
                                dayMode === "everyday"
                                  ? theme.primaryColor
                                  : `${theme.secondaryColor} hover:bg-muted/80`
                              }`}
                              onClick={() => handleDayModeChange("everyday")}
                            >
                              *
                            </button>
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-medium transition-colors border-l ${
                                dayMode === "dayOfWeek"
                                  ? theme.primaryColor
                                  : `${theme.secondaryColor} hover:bg-muted/80`
                              }`}
                              onClick={() => handleDayModeChange("dayOfWeek")}
                            >
                              W
                            </button>
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-medium transition-colors border-l ${
                                dayMode === "dayOfMonth"
                                  ? theme.primaryColor
                                  : `${theme.secondaryColor} hover:bg-muted/80`
                              }`}
                              onClick={() => handleDayModeChange("dayOfMonth")}
                            >
                              M
                            </button>
                          </div>
                        </div>
                        {dayMode === "dayOfWeek" ? (
                          <DayOfWeekPickerField
                            value={formData.dayOfWeek}
                            onChange={(val) => handleFormChange("dayOfWeek", val)}
                            label=""
                            placeholder="Select days"
                            theme={theme}
                          />
                        ) : dayMode === "dayOfMonth" ? (
                          <DayPickerField
                            value={formData.day}
                            onChange={(val) => handleFormChange("day", val)}
                            label=""
                            placeholder="Select days"
                            theme={theme}
                          />
                        ) : (
                          <div className="h-10 flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded border-2 border-dashed">
                            No day restrictions
                          </div>
                        )}
                      </div>
                    </div>

                    <FieldLabelWithInfo
                      label="Month"
                      description="Select specific months when the job should run. Use * for every month, individual months, ranges (JAN-MAR), or step intervals (*/3 for every 3 months). Supports both numeric (1-12) and text formats (JAN-DEC)."
                    >
                      <MonthPickerField
                        value={formData.month}
                        onChange={(val) => handleFormChange("month", val)}
                        label=""
                        placeholder="Every month"
                        theme={theme}
                      />
                    </FieldLabelWithInfo>
                  </div>
                ) : (
                  // Natural layout: Month -> Day Component -> Day Field -> Hour -> Minute -> Second
                  <div className={`grid gap-4 ${showSeconds ? "grid-cols-3" : "grid-cols-2"}`}>
                    <FieldLabelWithInfo
                      label="Month"
                      description="Select specific months when the job should run. Use * for every month, individual months, ranges (JAN-MAR), or step intervals (*/3 for every 3 months). Supports both numeric (1-12) and text formats (JAN-DEC)."
                    >
                      <MonthPickerField
                        value={formData.month}
                        onChange={(val) => handleFormChange("month", val)}
                        label=""
                        placeholder="Every month"
                        theme={theme}
                      />
                    </FieldLabelWithInfo>

                    <div className={showSeconds ? "col-span-2" : "col-span-1"}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Label className="text-sm font-medium">Day</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted/50">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 text-sm" side="top">
                                <p>
                                  Choose how to specify when the job runs: Every Day (ignores day restrictions), Day of
                                  Week (specific weekdays like Monday-Friday), or Day of Month (specific dates like 1st,
                                  15th).
                                </p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex rounded-md overflow-hidden border">
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-medium transition-colors ${
                                dayMode === "everyday"
                                  ? theme.primaryColor
                                  : `${theme.secondaryColor} hover:bg-muted/80`
                              }`}
                              onClick={() => handleDayModeChange("everyday")}
                            >
                              *
                            </button>
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-medium transition-colors border-l ${
                                dayMode === "dayOfWeek"
                                  ? theme.primaryColor
                                  : `${theme.secondaryColor} hover:bg-muted/80`
                              }`}
                              onClick={() => handleDayModeChange("dayOfWeek")}
                            >
                              W
                            </button>
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-medium transition-colors border-l ${
                                dayMode === "dayOfMonth"
                                  ? theme.primaryColor
                                  : `${theme.secondaryColor} hover:bg-muted/80`
                              }`}
                              onClick={() => handleDayModeChange("dayOfMonth")}
                            >
                              M
                            </button>
                          </div>
                        </div>
                        {dayMode === "dayOfWeek" ? (
                          <DayOfWeekPickerField
                            value={formData.dayOfWeek}
                            onChange={(val) => handleFormChange("dayOfWeek", val)}
                            label=""
                            placeholder="Select days"
                            theme={theme}
                          />
                        ) : dayMode === "dayOfMonth" ? (
                          <DayPickerField
                            value={formData.day}
                            onChange={(val) => handleFormChange("day", val)}
                            label=""
                            placeholder="Select days"
                            theme={theme}
                          />
                        ) : (
                          <div className="h-10 flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded border-2 border-dashed">
                            No day restrictions
                          </div>
                        )}
                      </div>
                    </div>

                    <FieldLabelWithInfo
                      label="Hour (12-hour format)"
                      description="Specifies the hour when the job should execute. Supports 12-hour format with AM/PM selection. Use * for every hour, specific hours, ranges, or intervals."
                    >
                      <HourPickerField
                        value={formData.hour}
                        onChange={(val) => handleFormChange("hour", val)}
                        label=""
                        placeholder="Any hour"
                        theme={theme}
                      />
                    </FieldLabelWithInfo>

                    <FieldLabelWithInfo
                      label="Minute (0-59)"
                      description="Specifies the minute within an hour when the job should execute. Use * for every minute, specific numbers (0-59), ranges (10-20), or intervals (*/15 for every 15 minutes)."
                    >
                      <TimePickerField
                        value={formData.minute}
                        onChange={(val) => handleFormChange("minute", val)}
                        label=""
                        max={59}
                        placeholder="Any minute"
                        theme={theme}
                      />
                    </FieldLabelWithInfo>

                    {showSeconds && (
                      <FieldLabelWithInfo
                        label="Second (0-59)"
                        description="Specifies the second within a minute when the job should execute. Use * for every second, specific numbers (0-59), ranges (10-20), or intervals (*/15 for every 15 seconds)."
                      >
                        <TimePickerField
                          value={formData.second}
                          onChange={(val) => handleFormChange("second", val)}
                          label=""
                          max={59}
                          placeholder="Any second"
                          theme={theme}
                        />
                      </FieldLabelWithInfo>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="custom" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="custom-cron">Cron Expression</Label>
                    {promptToCron && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted/50">
                            <Sparkles className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm" side="top">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium">AI Cron Generator</h4>
                              <p className="text-muted-foreground text-xs">
                                Describe when you want your task to run in natural language.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="prompt-input" className="text-xs">
                                Describe your schedule:
                              </Label>
                              <Textarea
                                id="prompt-input"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handlePromptKeyDown}
                                placeholder="e.g., 'Every weekday at 9 AM' or 'Every 15 minutes'"
                                className="min-h-[60px] text-xs resize-none"
                                disabled={isGenerating}
                              />
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">Press Enter to generate</div>
                                <Button
                                  size="sm"
                                  onClick={handlePromptSubmit}
                                  disabled={!prompt.trim() || isGenerating}
                                  className="h-6 px-2 text-xs"
                                >
                                  {isGenerating ? "Generating..." : "Generate"}
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="font-medium">Try these examples:</p>
                              <ul className="space-y-0.5 text-xs">
                                <li>• "Every day at 9 AM"</li>
                                <li>• "Weekdays at morning"</li>
                                <li>• "Every 15 minutes"</li>
                                <li>• "Every hour"</li>
                                <li>• "At midnight daily"</li>
                              </ul>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <Input
                    id="custom-cron"
                    value={customExpression}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="0 0 9 * * MON-FRI"
                    className={`font-mono ${!validation.isValid ? "border-destructive" : ""}`}
                  />
                </div>
                <div className={`text-xs text-muted-foreground space-y-2 ${theme.baseColor} p-3 rounded`}>
                  <div>
                    <p className="font-medium">Quartz Format (6 fields):</p>
                    <p>second minute hour day-of-month month day-of-week</p>
                  </div>
                  <div>
                    <p className="font-medium">Day Field Rules:</p>
                    <div className="space-y-1 text-xs">
                      <div>
                        • Use <code>*</code> for day-of-month and <code>?</code> for day-of-week to run every day
                      </div>
                      <div>
                        • Use <code>?</code> for day-of-month and specify day-of-week for weekly schedules
                      </div>
                      <div>
                        • Use <code>?</code> for day-of-week and specify day-of-month for monthly schedules
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Examples:</p>
                    <div className="space-y-1 font-mono text-xs">
                      <div>
                        <code>0 0 9 * * ?</code> - Every day at 9 AM
                      </div>
                      <div>
                        <code>0 0 9 ? * MON-FRI</code> - Weekdays at 9 AM
                      </div>
                      <div>
                        <code>0 0 9 1 * ?</code> - 1st day of every month at 9 AM
                      </div>
                      <div>
                        <code>0 */15 * * * ?</code> - Every 15 minutes
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* Status bar */}
            <div className={`border-t ${theme.baseColor} px-4 py-3`}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground font-medium">Expression:</span>
                <code className={`text-xs ${theme.baseColor} px-2 py-1 rounded text-xs font-mono`}>
                  {customExpression}
                </code>
              </div>
              <div className={`text-sm ${validation.isValid ? "text-foreground" : "text-destructive"}`}>
                {validation.isValid ? currentDescription : validation.error}
              </div>
            </div>
          </Tabs>
        </PopoverContent>
      </Popover>
    )
  }
)

CronInput.displayName = "CronInput"