# React Cron Field - Documentation

Welcome to the React Cron Field documentation. This knowledge base provides comprehensive information about the React Cron Field component library, which allows you to create user-friendly cron expression editors in your React applications.

## What is React Cron Field?

React Cron Field is a customizable React component for editing cron expressions with a user-friendly interface. It provides a visual builder for cron expressions, making it easy for users to create and understand scheduling configurations without needing to know the underlying cron syntax.

## Features

- 📅 Visual cron expression builder
- 🔄 Multiple layout options (cron-native or natural)
- 🎨 Customizable theming
- ⚡ Preset cron expressions
- 🔍 Validation and human-readable descriptions
- 🤖 Optional AI-powered cron generation (bring your own API)
- 📦 Lightweight and dependency-minimal

## Documentation Sections

- [Getting Started](./getting-started.md) - Installation and basic usage
- [Components](./components.md) - Detailed documentation of all components
- [API Reference](./api-reference.md) - Complete API documentation
- [Cron Syntax](./cron-syntax.md) - Understanding cron syntax and how it's used in this library
- [Examples](./examples.md) - Usage examples and patterns
- [Contributing](./contributing.md) - Guidelines for contributors

## Quick Start

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.