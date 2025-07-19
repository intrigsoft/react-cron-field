# Components

React Cron Field consists of several components that work together to provide a comprehensive cron expression editor. This document provides detailed information about each component.

## Main Component

### CronInput

The `CronInput` component is the main component of the library. It provides a user-friendly interface for editing cron expressions.

```jsx
import { CronInput } from 'react-cron-field';

function App() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  return (
    <CronInput 
      value={cronExpression} 
      onChange={setCronExpression} 
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `"0 0 * * * *"` | The cron expression value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the cron expression changes |
| `placeholder` | `string` | `"Select cron expression"` | Placeholder text when no expression is selected |
| `presets` | `Array<{ label: string; value: string; description: string }>` | Built-in presets | Custom presets to show in the presets tab |
| `layout` | `"cron-native" \| "natural"` | `"cron-native"` | Layout style for the builder interface |
| `promptToCron` | `(prompt: string) => Promise<string>` | `undefined` | Optional function to convert natural language to cron expressions |
| `showSeconds` | `boolean` | `true` | Whether to show the seconds field in the builder interface |
| `theme` | `{ baseColor?: string; primaryColor?: string; secondaryColor?: string }` | Default theme | Custom theme colors |

#### Features

- **Visual Builder**: Provides a visual interface for building cron expressions
- **Presets**: Includes common cron expression presets
- **Custom Expression**: Allows direct editing of the cron expression
- **Validation**: Validates cron expressions and provides error messages
- **Human-readable Descriptions**: Converts cron expressions to human-readable descriptions
- **AI-powered Generation**: Optionally supports generating cron expressions from natural language

## Sub-components

The following components are used internally by the `CronInput` component but can also be used independently if needed.

### TimePickerField

A component for selecting time values (seconds, minutes).

```jsx
import { TimePickerField } from 'react-cron-field';

function App() {
  const [value, setValue] = useState('*');

  return (
    <TimePickerField
      value={value}
      onChange={setValue}
      label="Seconds"
      max={59}
      placeholder="Any second"
    />
  );
}
```

### HourPickerField

A component for selecting hour values with AM/PM support.

```jsx
import { HourPickerField } from 'react-cron-field';

function App() {
  const [value, setValue] = useState('*');

  return (
    <HourPickerField
      value={value}
      onChange={setValue}
      label="Hour"
      placeholder="Any hour"
    />
  );
}
```

### DayPickerField

A component for selecting days of the month.

```jsx
import { DayPickerField } from 'react-cron-field';

function App() {
  const [value, setValue] = useState('*');

  return (
    <DayPickerField
      value={value}
      onChange={setValue}
      label="Day of Month"
      placeholder="Select days"
    />
  );
}
```

### DayOfWeekPickerField

A component for selecting days of the week.

```jsx
import { DayOfWeekPickerField } from 'react-cron-field';

function App() {
  const [value, setValue] = useState('*');

  return (
    <DayOfWeekPickerField
      value={value}
      onChange={setValue}
      label="Day of Week"
      placeholder="Select days"
    />
  );
}
```

### MonthPickerField

A component for selecting months.

```jsx
import { MonthPickerField } from 'react-cron-field';

function App() {
  const [value, setValue] = useState('*');

  return (
    <MonthPickerField
      value={value}
      onChange={setValue}
      label="Month"
      placeholder="Every month"
    />
  );
}
```

### AnalogClockFace

A visual component that displays an analog clock face for selecting hours.

```jsx
import { AnalogClockFace } from 'react-cron-field';

function App() {
  const [hour, setHour] = useState(9);
  const [period, setPeriod] = useState('AM');

  return (
    <AnalogClockFace
      selectedHour={hour}
      period={period}
      onHourSelect={(newHour) => setHour(newHour)}
      onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
    />
  );
}
```

## UI Components

React Cron Field also includes several UI components that are used internally but can be used independently in your application:

- `Button`: A customizable button component
- `Input`: A text input component
- `Label`: A label component for form fields
- `Popover`: A popover component for displaying content in a floating panel
- `Tabs`: A tabbed interface component
- `Card`: A card component for displaying content in a container
- `Alert`: An alert component for displaying messages
- `Badge`: A badge component for displaying small pieces of information

These components are styled using Tailwind CSS and can be customized using the theme props.

## Next Steps

- See the [API Reference](./api-reference.md) for a complete list of props and methods
- Explore [Examples](./examples.md) for more usage patterns
