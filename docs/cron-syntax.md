# Cron Syntax

This document explains cron syntax and how it's used in the React Cron Field library.

## What is a Cron Expression?

A cron expression is a string consisting of 5 or 6 fields that represent a schedule. The fields specify when a job should run, from seconds to days of the week.

## Cron Format

React Cron Field uses the Quartz cron format, which consists of 6 fields:

```
┌───────────── second (0-59)
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of the month (1-31)
│ │ │ │ ┌───────────── month (1-12 or JAN-DEC)
│ │ │ │ │ ┌───────────── day of the week (0-6 or SUN-SAT)
│ │ │ │ │ │
* * * * * *
```

The library also supports the standard 5-field cron format (without seconds):

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of the month (1-31)
│ │ │ ┌───────────── month (1-12 or JAN-DEC)
│ │ │ │ ┌───────────── day of the week (0-6 or SUN-SAT)
│ │ │ │ │
* * * * *
```

When using the 5-field format, the library automatically adds a `0` for the seconds field when converting to the 6-field format.

## Special Characters

Cron expressions use several special characters to define complex schedules:

| Character | Description | Example |
|-----------|-------------|---------|
| `*` | Any value | `* * * * * *` = Run every second |
| `,` | Value list separator | `0 0 9,12,15 * * *` = Run at 9am, 12pm, and 3pm |
| `-` | Range of values | `0 0 9-17 * * *` = Run every hour from 9am to 5pm |
| `/` | Step values | `0 */15 * * * *` = Run every 15 minutes |
| `?` | No specific value (only for day-of-month and day-of-week) | `0 0 * ? * MON-FRI` = Run at midnight on weekdays |
| `L` | Last day of month or week | `0 0 * L * *` = Run at midnight on the last day of the month |
| `W` | Nearest weekday | `0 0 * 15W * *` = Run at midnight on the nearest weekday to the 15th |
| `#` | Nth day of the month | `0 0 * * * 2#1` = Run at midnight on the first Monday of the month |

## Day of Week and Day of Month Constraints

In the Quartz cron format, there's a special rule for the day-of-month and day-of-week fields:

- If you specify a value for day-of-week, you should use `?` for day-of-month
- If you specify a value for day-of-month, you should use `?` for day-of-week
- If you want to run every day, use `*` for day-of-month and `?` for day-of-week

This is because it doesn't make sense to specify both "run on the 15th of the month" and "run on Monday" at the same time.

React Cron Field handles this automatically in the UI by providing three day modes:
- **Every day**: Sets day-of-month to `*` and day-of-week to `?`
- **Day of Week**: Allows selecting specific days of the week and sets day-of-month to `?`
- **Day of Month**: Allows selecting specific days of the month and sets day-of-week to `?`

## Common Cron Patterns

Here are some common cron patterns that you can use:

| Description | Cron Expression |
|-------------|----------------|
| Every minute | `0 * * * * *` |
| Every 5 minutes | `0 */5 * * * *` |
| Every hour | `0 0 * * * *` |
| Every day at midnight | `0 0 0 * * *` |
| Every day at 9am | `0 0 9 * * *` |
| Weekdays at 9am | `0 0 9 * * MON-FRI` |
| Weekends at 9am | `0 0 9 * * SAT,SUN` |
| First day of the month | `0 0 0 1 * *` |
| Last day of the month | `0 0 0 L * *` |
| Every 15 minutes during business hours | `0 */15 9-17 * * MON-FRI` |

## How React Cron Field Uses Cron Expressions

React Cron Field provides several ways to work with cron expressions:

1. **Visual Builder**: The component provides a visual interface for building cron expressions without needing to know the syntax.

2. **Presets**: The component includes common cron expression presets that you can select.

3. **Custom Expression**: You can directly edit the cron expression if you're familiar with the syntax.

4. **Utility Functions**: The library provides utility functions for working with cron expressions:
   - `parseCronExpression`: Parses a cron expression string into its component parts
   - `formatCronExpression`: Formats a cron expression object back into a string
   - `describeCronExpression`: Converts a cron expression to a human-readable description
   - `validateCronExpression`: Validates a cron expression

## Human-readable Descriptions

React Cron Field uses the [cronstrue](https://github.com/bradymholt/cRonstrue) library to convert cron expressions to human-readable descriptions. For example:

| Cron Expression | Human-readable Description |
|-----------------|----------------------------|
| `0 0 * * * *` | Every hour |
| `0 0 9 * * MON-FRI` | At 09:00 AM on weekdays |
| `0 */15 * * * *` | Every 15 minutes |
| `0 0 0 1 * *` | At 12:00 AM on day 1 of the month |

## Validation

React Cron Field validates cron expressions to ensure they are valid. If an expression is invalid, the component will display an error message and the `validateCronExpression` function will return an object with `isValid: false` and an error message.

Common validation errors include:
- Invalid number of fields (must be 5 or 6)
- Invalid values for fields (e.g., minutes must be 0-59)
- Invalid combinations of day-of-month and day-of-week

## Next Steps

- See the [API Reference](./api-reference.md) for details on the cron utility functions
- Explore [Examples](./examples.md) for more usage patterns