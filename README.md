# React Cron Field

A customizable React component for editing cron expressions with a user-friendly interface.

## Features

- 📅 Visual cron expression builder
- 🔄 Multiple layout options (cron-native or natural)
- 🎨 Customizable theming
- ⚡ Preset cron expressions
- 🔍 Validation and human-readable descriptions
- 🤖 Optional AI-powered cron generation (bring your own API)
- 📦 Lightweight and dependency-minimal

## Installation

```bash
npm install react-cron-field
# or
yarn add react-cron-field
# or
pnpm add react-cron-field
```

## Usage

```jsx
import { CronInput } from 'react-cron-field';

function App() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  return (
    <div>
      <h1>Schedule your task</h1>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression} 
      />
      <p>Current expression: {cronExpression}</p>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `"0 0 * * * *"` | The cron expression value |
| `onChange` | `(value: string) => void` | `undefined` | Callback when the cron expression changes |
| `placeholder` | `string` | `"Select cron expression"` | Placeholder text when no expression is selected |
| `presets` | `Array<{ label: string; value: string; description: string }>` | Built-in presets | Custom presets to show in the presets tab |
| `layout` | `"cron-native" \| "natural"` | `"cron-native"` | Layout style for the builder interface |
| `promptToCron` | `(prompt: string) => Promise<string>` | `undefined` | Optional function to convert natural language to cron expressions |
| `theme` | `{ baseColor?: string; primaryColor?: string; secondaryColor?: string }` | Default theme | Custom theme colors |

## Utility Functions

The library also exports utility functions for working with cron expressions:

```jsx
import { 
  parseCronExpression, 
  formatCronExpression, 
  describeCronExpression, 
  validateCronExpression,
  CRON_PRESETS
} from 'react-cron-field';

// Parse a cron expression into its components
const parsed = parseCronExpression('0 0 9 * * MON-FRI');

// Format cron components back into a string
const formatted = formatCronExpression(parsed);

// Get a human-readable description
const description = describeCronExpression('0 0 9 * * MON-FRI');
// "At 09:00 AM on weekdays"

// Validate a cron expression
const validation = validateCronExpression('0 0 9 * * MON-FRI');
// { isValid: true }
```

## Styling

The component uses CSS classes that can be styled with your preferred CSS solution. The component also accepts theme props for customizing colors.

## Documentation & Examples

For detailed documentation, please check out the following resources:

- [Getting Started](./docs/getting-started.md) - Installation and basic usage
- [Examples](./docs/examples.md) - Usage examples and patterns
- [Contributing](./docs/contributing.md) - Guidelines for contributors

This library also includes a Storybook with interactive examples and documentation:

```bash
# Clone the repository
git clone https://github.com/yourusername/react-cron-field.git
cd react-cron-field

# Install dependencies
npm install

# Run Storybook
npm run storybook
```

The Storybook includes:
- Interactive examples of all components
- Documentation of props and usage
- Different configurations and use cases
- Theming examples

## License

MIT
