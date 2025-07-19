# API Reference

This document provides detailed API documentation for the React Cron Field library.

## Components API

### CronInput

The main component for editing cron expressions.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `"0 0 * * * *"` | The cron expression value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the cron expression changes |
| `placeholder` | `string` | `"Select cron expression"` | Placeholder text when no expression is selected |
| `presets` | `Array<{ label: string; value: string; description: string }>` | `CRON_PRESETS` | Custom presets to show in the presets tab |
| `layout` | `"cron-native" \| "natural"` | `"cron-native"` | Layout style for the builder interface |
| `promptToCron` | `(prompt: string) => Promise<string>` | `undefined` | Optional function to convert natural language to cron expressions |
| `showSeconds` | `boolean` | `true` | Whether to show the seconds field in the builder interface |
| `theme` | `{ baseColor?: string; primaryColor?: string; secondaryColor?: string }` | Default theme | Custom theme colors |

#### Theme Object

The `theme` prop accepts an object with the following properties:

```typescript
{
  baseColor?: string;      // Background color for containers
  primaryColor?: string;   // Color for primary elements like selected tabs
  secondaryColor?: string; // Color for secondary elements
}
```

Default values:
```typescript
{
  baseColor: "bg-muted/30 dark:bg-muted/20",
  primaryColor: "bg-primary text-primary-foreground",
  secondaryColor: "bg-muted text-muted-foreground",
}
```

#### Preset Object

The `presets` prop accepts an array of objects with the following properties:

```typescript
{
  label: string;       // Display name for the preset
  value: string;       // Cron expression value
  description: string; // Description of when the cron will run
}
```

### TimePickerField

Component for selecting time values (seconds, minutes).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The current value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the value changes |
| `label` | `string` | `""` | Label for the field |
| `max` | `number` | `59` | Maximum value (typically 59 for seconds/minutes) |
| `placeholder` | `string` | `"Any"` | Placeholder text |
| `theme` | `ThemeObject` | Default theme | Custom theme colors |

### HourPickerField

Component for selecting hour values with AM/PM support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The current value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the value changes |
| `label` | `string` | `""` | Label for the field |
| `placeholder` | `string` | `"Any hour"` | Placeholder text |
| `theme` | `ThemeObject` | Default theme | Custom theme colors |

### DayPickerField

Component for selecting days of the month.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The current value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the value changes |
| `label` | `string` | `""` | Label for the field |
| `placeholder` | `string` | `"Select days"` | Placeholder text |
| `theme` | `ThemeObject` | Default theme | Custom theme colors |

### DayOfWeekPickerField

Component for selecting days of the week.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The current value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the value changes |
| `label` | `string` | `""` | Label for the field |
| `placeholder` | `string` | `"Select days"` | Placeholder text |
| `theme` | `ThemeObject` | Default theme | Custom theme colors |

### MonthPickerField

Component for selecting months.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The current value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the value changes |
| `label` | `string` | `""` | Label for the field |
| `placeholder` | `string` | `"Every month"` | Placeholder text |
| `theme` | `ThemeObject` | Default theme | Custom theme colors |

### AnalogClockFace

Visual component that displays an analog clock face for selecting hours.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedHour` | `number` | `undefined` | The currently selected hour (1-12) |
| `period` | `"AM" \| "PM"` | `"AM"` | The currently selected period |
| `onHourSelect` | `(hour: number) => void` | `undefined` | Callback when an hour is selected |
| `onPeriodChange` | `(period: "AM" \| "PM") => void` | `undefined` | Callback when the period changes |

## Utility Functions API

React Cron Field exports several utility functions for working with cron expressions.

### parseCronExpression

Parses a cron expression string into its component parts.

```typescript
function parseCronExpression(expression: string): CronExpression
```

#### Parameters

- `expression` (string): The cron expression to parse

#### Returns

A `CronExpression` object with the following properties:

```typescript
interface CronExpression {
  second: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  dayOfWeek: string;
}
```

#### Example

```typescript
import { parseCronExpression } from 'react-cron-field';

const parsed = parseCronExpression('0 0 9 * * MON-FRI');
// {
//   second: '0',
//   minute: '0',
//   hour: '9',
//   day: '*',
//   month: '*',
//   dayOfWeek: 'MON-FRI'
// }
```

### formatCronExpression

Formats a `CronExpression` object back into a cron expression string.

```typescript
function formatCronExpression(cron: CronExpression): string
```

#### Parameters

- `cron` (CronExpression): The cron expression object to format

#### Returns

A string representation of the cron expression.

#### Example

```typescript
import { formatCronExpression } from 'react-cron-field';

const formatted = formatCronExpression({
  second: '0',
  minute: '0',
  hour: '9',
  day: '*',
  month: '*',
  dayOfWeek: 'MON-FRI'
});
// '0 0 9 * * MON-FRI'
```

### describeCronExpression

Converts a cron expression to a human-readable description.

```typescript
function describeCronExpression(expression: string): string
```

#### Parameters

- `expression` (string): The cron expression to describe

#### Returns

A human-readable description of the cron expression.

#### Example

```typescript
import { describeCronExpression } from 'react-cron-field';

const description = describeCronExpression('0 0 9 * * MON-FRI');
// 'At 09:00 AM on weekdays'
```

### validateCronExpression

Validates a cron expression.

```typescript
function validateCronExpression(expression: string): { isValid: boolean; error?: string }
```

#### Parameters

- `expression` (string): The cron expression to validate

#### Returns

An object with the following properties:
- `isValid` (boolean): Whether the expression is valid
- `error` (string, optional): Error message if the expression is invalid

#### Example

```typescript
import { validateCronExpression } from 'react-cron-field';

const validation = validateCronExpression('0 0 9 * * MON-FRI');
// { isValid: true }

const invalidValidation = validateCronExpression('invalid');
// { isValid: false, error: 'Cron expression must have 5 or 6 fields' }
```

### CRON_PRESETS

A constant array of preset cron expressions.

```typescript
const CRON_PRESETS: Array<{ label: string; value: string; description: string }>
```

#### Example

```typescript
import { CRON_PRESETS } from 'react-cron-field';

console.log(CRON_PRESETS);
// [
//   {
//     label: 'Every minute',
//     value: '0 * * * * *',
//     description: 'Runs every minute'
//   },
//   ...
// ]
```

## Type Definitions

### CronExpression

```typescript
interface CronExpression {
  second: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  dayOfWeek: string;
}
```

### ThemeObject

```typescript
interface ThemeObject {
  baseColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}
```

### PresetObject

```typescript
interface PresetObject {
  label: string;
  value: string;
  description: string;
}
```
