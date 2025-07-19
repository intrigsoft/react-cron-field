"use client"

import * as React from "react"

interface AnalogClockFaceProps {
  max: number // 59 for seconds/minutes, 23 for hours, 11 for 12-hour
  selectedValues: number[]
  stepPrimary: number[]
  stepSecondary: number[]
  ranges: Array<{ start: number; end: number }>
  highlightedValue: number | null
  onValueClick: (value: number) => void
  rangeStart: number | null
  isRangeMode: boolean
  is12Hour?: boolean
  viewMode?: "AM" | "PM"
  theme?: {
    baseColor?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

// This component is intentionally not exported as it's for internal use only
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AnalogClockFace({
  max,
  selectedValues,
  stepPrimary,
  stepSecondary,
  ranges,
  highlightedValue,
  onValueClick,
  rangeStart,
  isRangeMode,
  is12Hour = false,
  viewMode,
}: AnalogClockFaceProps) {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null)

  const radius = 80
  const centerX = 100
  const centerY = 100
  const totalSize = 200

  // Calculate position for a value on the clock
  const getPosition = React.useCallback((value: number, total: number) => {
    const angle = (value / total) * 2 * Math.PI - Math.PI / 2 // Start from top (12 o'clock)
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    return { x, y, angle }
  }, [])

  // Get display value for clock face
  const getDisplayValue = React.useCallback(
    (value: number) => {
      if (is12Hour) {
        return value === 0 ? 12 : value
      }
      return value
    },
    [is12Hour],
  )

  // Handle mouse events
  const handleMouseDown = React.useCallback(
    (value: number) => {
      onValueClick(value)
    },
    [onValueClick],
  )

  const handleMouseUp = React.useCallback(() => {
    // Mouse up handler
  }, [])

  const handleMouseEnter = React.useCallback((value: number) => {
    setHoveredValue(value)
  }, [])

  const handleMouseLeave = React.useCallback(() => {
    setHoveredValue(null)
  }, [])

  // Check if value is in a range (without step)
  const isInRange = React.useCallback(
    (value: number) => {
      return ranges.some((range) => value >= range.start && value <= range.end)
    },
    [ranges],
  )

  // Generate all values for the clock
  const allValues = Array.from({ length: max + 1 }, (_, i) => i)

  // Generate hour markers (12 for hours, or based on max for minutes/seconds)
  const majorMarkers = is12Hour ? 12 : Math.min(12, max + 1)

  return (
    <div className="flex items-center justify-center">
      <svg
        width={totalSize}
        height={totalSize}
        className="select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredValue(null)
        }}
      >
        {/* Outer circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 15}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          className="drop-shadow-sm"
        />

        {/* Inner circle background */}
        <circle cx={centerX} cy={centerY} r={radius + 12} fill="hsl(var(--background))" className="drop-shadow-sm" />

        {/* Major hour markers */}
        {Array.from({ length: majorMarkers }, (_, i) => {
          const value = is12Hour ? (i === 0 ? 12 : i) : i * Math.floor((max + 1) / majorMarkers)
          const pos = getPosition(i, majorMarkers)
          const markerLength = 12
          const innerRadius = radius + 2
          const outerRadius = radius + 2 + markerLength

          const innerX = centerX + innerRadius * Math.cos(pos.angle)
          const innerY = centerY + innerRadius * Math.sin(pos.angle)
          const outerX = centerX + outerRadius * Math.cos(pos.angle)
          const outerY = centerY + outerRadius * Math.sin(pos.angle)

          return (
            <g key={`major-${i}`}>
              <line
                x1={innerX}
                y1={innerY}
                x2={outerX}
                y2={outerY}
                stroke="hsl(var(--foreground))"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Hour numbers */}
              {is12Hour && (
                <text
                  x={centerX + (radius - 20) * Math.cos(pos.angle)}
                  y={centerY + (radius - 20) * Math.sin(pos.angle)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold fill-foreground select-none"
                >
                  {value}
                </text>
              )}
            </g>
          )
        })}

        {/* Minor markers */}
        {!is12Hour &&
          Array.from({ length: Math.min(60, (max + 1) * 4) }, (_, i) => {
            if (i % (4 * Math.floor((max + 1) / majorMarkers)) === 0) return null // Skip major markers

            const angle = (i / (4 * (max + 1))) * 2 * Math.PI - Math.PI / 2
            const markerLength = 6
            const innerRadius = radius + 2
            const outerRadius = radius + 2 + markerLength

            const innerX = centerX + innerRadius * Math.cos(angle)
            const innerY = centerY + innerRadius * Math.sin(angle)
            const outerX = centerX + outerRadius * Math.cos(angle)
            const outerY = centerY + outerRadius * Math.sin(angle)

            return (
              <line
                key={`minor-${i}`}
                x1={innerX}
                y1={innerY}
                x2={outerX}
                y2={outerY}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1"
                strokeLinecap="round"
              />
            )
          })}

        {/* Range arcs */}
        {ranges.map((range, index) => {
          const startAngle = (range.start / (max + 1)) * 2 * Math.PI - Math.PI / 2
          const endAngle = (range.end / (max + 1)) * 2 * Math.PI - Math.PI / 2
          const arcRadius = radius - 10

          const startX = centerX + arcRadius * Math.cos(startAngle)
          const startY = centerY + arcRadius * Math.sin(startAngle)
          const endX = centerX + arcRadius * Math.cos(endAngle)
          const endY = centerY + arcRadius * Math.sin(endAngle)

          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

          return (
            <path
              key={`range-${index}`}
              d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
              fill="none"
              stroke="hsl(var(--primary) / 0.6)"
              strokeWidth="4"
              strokeLinecap="round"
              className="pointer-events-none"
            />
          )
        })}

        {/* Selected value hands */}
        {allValues.map((value) => {
          const isSelected = selectedValues.includes(value)
          const isPrimaryStep = stepPrimary.includes(value)
          const isSecondaryStep = stepSecondary.includes(value)
          const isHighlighted = highlightedValue === value
          const isHovered = hoveredValue === value
          const inRange = isInRange(value)

          if (!isSelected && !isPrimaryStep && !isSecondaryStep && !isHovered) return null

          const pos = getPosition(value, max + 1)
          let handLength = radius - 25
          let strokeWidth = 3
          let strokeColor = "hsl(var(--muted-foreground) / 0.4)"

          if (isSelected) {
            if (inRange) {
              strokeColor = "hsl(var(--primary) / 0.8)"
              strokeWidth = 4
              handLength = radius - 20
            } else if (isPrimaryStep) {
              strokeColor = "hsl(var(--primary))"
              strokeWidth = 5
              handLength = radius - 15
            } else if (isSecondaryStep) {
              strokeColor = "hsl(var(--primary) / 0.6)"
              strokeWidth = 3
              handLength = radius - 25
            } else {
              strokeColor = "hsl(var(--primary))"
              strokeWidth = 4
              handLength = radius - 20
            }
          }

          if (isHovered && !isSelected) {
            strokeColor = "hsl(var(--primary) / 0.6)"
            strokeWidth = 4
            handLength = radius - 20
          }

          if (isHighlighted) {
            strokeColor = "hsl(var(--ring))"
            strokeWidth = 6
            handLength = radius - 10
          }

          return (
            <line
              key={`hand-${value}`}
              x1={centerX}
              y1={centerY}
              x2={centerX + handLength * Math.cos(pos.angle)}
              y2={centerY + handLength * Math.sin(pos.angle)}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="pointer-events-none transition-all duration-200 ease-out"
              strokeDasharray={isSecondaryStep && !isPrimaryStep ? "4,4" : "none"}
            />
          )
        })}

        {/* Range start indicator */}
        {isRangeMode && rangeStart !== null && (
          <g>
            {(() => {
              const pos = getPosition(rangeStart, max + 1)
              const handLength = radius - 15
              return (
                <>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={centerX + handLength * Math.cos(pos.angle)}
                    y2={centerY + handLength * Math.sin(pos.angle)}
                    stroke="hsl(var(--ring))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="6,3"
                    className="pointer-events-none animate-pulse"
                  />
                  <circle
                    cx={centerX + handLength * Math.cos(pos.angle)}
                    cy={centerY + handLength * Math.sin(pos.angle)}
                    r="4"
                    fill="hsl(var(--ring))"
                    className="pointer-events-none animate-pulse"
                  />
                </>
              )
            })()}
          </g>
        )}

        {/* Clickable areas */}
        {allValues.map((value) => {
          const pos = getPosition(value, max + 1)
          const clickRadius = 15

          return (
            <circle
              key={`click-${value}`}
              cx={centerX + (radius - 25) * Math.cos(pos.angle)}
              cy={centerY + (radius - 25) * Math.sin(pos.angle)}
              r={clickRadius}
              fill="transparent"
              className="cursor-pointer"
              onMouseDown={() => handleMouseDown(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
            />
          )
        })}

        {/* Hover indicators */}
        {hoveredValue !== null && (
          <g>
            {(() => {
              const pos = getPosition(hoveredValue, max + 1)
              const handLength = radius - 20
              return (
                <>
                  <circle
                    cx={centerX + handLength * Math.cos(pos.angle)}
                    cy={centerY + handLength * Math.sin(pos.angle)}
                    r="8"
                    fill="none"
                    stroke="hsl(var(--primary) / 0.4)"
                    strokeWidth="2"
                    className="pointer-events-none animate-pulse"
                  />
                  <text
                    x={centerX + (handLength + 20) * Math.cos(pos.angle)}
                    y={centerY + (handLength + 20) * Math.sin(pos.angle)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium pointer-events-none select-none fill-foreground"
                    style={{
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                    }}
                  >
                    {getDisplayValue(hoveredValue)}
                  </text>
                </>
              )
            })()}
          </g>
        )}

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill="hsl(var(--destructive))"
          stroke="hsl(var(--background))"
          strokeWidth="2"
          className="drop-shadow-sm"
        />

        {/* View mode indicator for 12-hour clock */}
        {is12Hour && viewMode && (
          <text
            x={centerX}
            y={centerY + 35}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-bold fill-primary select-none"
          >
            {viewMode}
          </text>
        )}
      </svg>
    </div>
  )
}
