import cronstrue from "cronstrue"

export interface CronExpression {
  second: string
  minute: string
  hour: string
  day: string
  month: string
  dayOfWeek: string
}

export function parseCronExpression(expression: string): CronExpression {
  const parts = expression.trim().split(/\s+/)

  // Handle both 5-field and 6-field cron expressions
  if (parts.length === 5) {
    // Standard 5-field cron: minute hour day month dayOfWeek
    return {
      second: "0",
      minute: parts[0] || "*",
      hour: parts[1] || "*",
      day: parts[2] || "*",
      month: parts[3] || "*",
      dayOfWeek: parts[4] || "*",
    }
  } else if (parts.length === 6) {
    // Quartz 6-field cron: second minute hour day month dayOfWeek
    return {
      second: parts[0] || "*",
      minute: parts[1] || "*",
      hour: parts[2] || "*",
      day: parts[3] || "*",
      month: parts[4] || "*",
      dayOfWeek: parts[5] || "*",
    }
  }

  // Default fallback
  return {
    second: "*",
    minute: "*",
    hour: "*",
    day: "*",
    month: "*",
    dayOfWeek: "*",
  }
}

export function formatCronExpression(cron: CronExpression): string {
  return `${cron.second} ${cron.minute} ${cron.hour} ${cron.day} ${cron.month} ${cron.dayOfWeek}`
}

export function describeCronExpression(expression: string): string {
  try {
    // Clean up the expression
    const cleanExpression = expression.trim()

    if (!cleanExpression || cleanExpression === "*") {
      return "Every second"
    }

    // Parse the expression to determine if it's 5-field or 6-field
    const parts = cleanExpression.split(/\s+/)

    if (parts.length === 6) {
      // 6-field Quartz format - use directly with cronstrue
      return cronstrue.toString(cleanExpression, {
        throwExceptionOnParseError: false,
        verbose: false,
        dayOfWeekStartIndexZero: true,
        use24HourTimeFormat: false,
        locale: "en",
      })
    } else if (parts.length === 5) {
      // 5-field standard format - convert to 6-field by prepending "0" for seconds
      const sixFieldExpression = `0 ${cleanExpression}`
      return cronstrue.toString(sixFieldExpression, {
        throwExceptionOnParseError: false,
        verbose: false,
        dayOfWeekStartIndexZero: true,
        use24HourTimeFormat: false,
        locale: "en",
      })
    } else {
      // Invalid format, fall back to basic description
      return "Invalid cron expression"
    }
  } catch (error) {
    // Fallback to basic description if cronstrue fails
    try {
      const cron = parseCronExpression(expression)
      return getBasicDescription(cron)
    } catch (fallbackError) {
      return "Invalid cron expression"
    }
  }
}

// Fallback basic description function
function getBasicDescription(cron: CronExpression): string {
  // Handle common patterns first
  if (
    cron.second === "0" &&
    cron.minute === "0" &&
    cron.hour === "0" &&
    cron.day === "*" &&
    cron.month === "*" &&
    cron.dayOfWeek === "*"
  ) {
    return "Every day at midnight"
  }

  if (
    cron.second === "0" &&
    cron.minute === "0" &&
    cron.hour === "9" &&
    cron.day === "*" &&
    cron.month === "*" &&
    cron.dayOfWeek === "*"
  ) {
    return "Every day at 9:00 AM"
  }

  if (
    cron.second === "0" &&
    cron.minute === "0" &&
    cron.hour === "9" &&
    cron.day === "*" &&
    cron.month === "*" &&
    cron.dayOfWeek === "MON-FRI"
  ) {
    return "Weekdays at 9:00 AM"
  }

  if (
    cron.second === "0" &&
    cron.minute === "*/15" &&
    cron.hour === "*" &&
    cron.day === "*" &&
    cron.month === "*" &&
    cron.dayOfWeek === "*"
  ) {
    return "Every 15 minutes"
  }

  if (
    cron.second === "0" &&
    cron.minute === "0" &&
    cron.hour === "0" &&
    cron.day === "1" &&
    cron.month === "*" &&
    cron.dayOfWeek === "*"
  ) {
    return "First day of every month at midnight"
  }

  // Build description from parts
  let description = "At "

  // Time part
  if (cron.hour === "*" && cron.minute === "*" && cron.second === "*") {
    description += "every second"
  } else if (cron.hour === "*" && cron.minute === "*") {
    description += `${cron.second} seconds past every minute`
  } else if (cron.hour === "*") {
    description += `${cron.minute} minutes past every hour`
  } else {
    const hour = Number.parseInt(cron.hour)
    const minute = Number.parseInt(cron.minute)
    if (!isNaN(hour) && !isNaN(minute)) {
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      description += `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`
    } else {
      description += `hour ${cron.hour}, minute ${cron.minute}`
    }
  }

  // Day part
  if (cron.day !== "*" && cron.day !== "?") {
    description += ` on day ${cron.day} of the month`
  } else if (cron.dayOfWeek !== "*" && cron.dayOfWeek !== "?") {
    const dayNames: { [key: string]: string } = {
      "0": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3": "Wednesday",
      "4": "Thursday",
      "5": "Friday",
      "6": "Saturday",
      SUN: "Sunday",
      MON: "Monday",
      TUE: "Tuesday",
      WED: "Wednesday",
      THU: "Thursday",
      FRI: "Friday",
      SAT: "Saturday",
    }

    if (cron.dayOfWeek === "MON-FRI") {
      description += " on weekdays"
    } else if (dayNames[cron.dayOfWeek]) {
      description += ` on ${dayNames[cron.dayOfWeek]}`
    } else {
      description += ` on ${cron.dayOfWeek}`
    }
  }

  // Month part
  if (cron.month !== "*") {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const monthNum = Number.parseInt(cron.month)
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      description += ` in ${monthNames[monthNum - 1]}`
    } else {
      description += ` in ${cron.month}`
    }
  }

  return description
}

export function validateCronExpression(expression: string): { isValid: boolean; error?: string } {
  try {
    const parts = expression.trim().split(/\s+/)

    if (parts.length !== 5 && parts.length !== 6) {
      return {
        isValid: false,
        error: "Cron expression must have 5 or 6 fields",
      }
    }

    // Try to parse with cronstrue to validate
    if (parts.length === 6) {
      cronstrue.toString(expression, { throwExceptionOnParseError: true })
    } else {
      cronstrue.toString(`0 ${expression}`, { throwExceptionOnParseError: true })
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid cron expression format",
    }
  }
}

export const CRON_PRESETS = [
  {
    label: "Every minute",
    value: "0 * * * * *",
    description: "Runs every minute",
  },
  {
    label: "Every 5 minutes",
    value: "0 */5 * * * *",
    description: "Runs every 5 minutes",
  },
  {
    label: "Every 15 minutes",
    value: "0 */15 * * * *",
    description: "Runs every 15 minutes",
  },
  {
    label: "Every 30 minutes",
    value: "0 */30 * * * *",
    description: "Runs every 30 minutes",
  },
  {
    label: "Every hour",
    value: "0 0 * * * *",
    description: "Runs every hour at minute 0",
  },
  {
    label: "Every 2 hours",
    value: "0 0 */2 * * *",
    description: "Runs every 2 hours",
  },
  {
    label: "Every day at midnight",
    value: "0 0 0 * * *",
    description: "Runs once a day at 00:00",
  },
  {
    label: "Every day at 9 AM",
    value: "0 0 9 * * *",
    description: "Runs once a day at 09:00",
  },
  {
    label: "Weekdays at 9 AM",
    value: "0 0 9 * * MON-FRI",
    description: "Runs Monday through Friday at 09:00",
  },
  {
    label: "Every Monday at 9 AM",
    value: "0 0 9 * * MON",
    description: "Runs every Monday at 09:00",
  },
  {
    label: "First day of month",
    value: "0 0 0 1 * *",
    description: "Runs on the 1st day of every month at midnight",
  },
  {
    label: "Every Sunday at 2 AM",
    value: "0 0 2 * * SUN",
    description: "Runs every Sunday at 02:00",
  },
]