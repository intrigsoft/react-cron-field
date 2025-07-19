# Getting Started with React Cron Field

This guide will help you get started with React Cron Field in your React application.

## Installation

You can install React Cron Field using npm, yarn, or pnpm:

```bash
# Using npm
npm install react-cron-field

# Using yarn
yarn add react-cron-field

# Using pnpm
pnpm add react-cron-field
```

## Basic Usage

Here's a simple example of how to use the CronInput component:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function ScheduleComponent() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  return (
    <div>
      <h2>Schedule Configuration</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression} 
      />
      <p>Current cron expression: {cronExpression}</p>
    </div>
  );
}

export default ScheduleComponent;
```

## Required CSS

React Cron Field uses CSS for styling. Make sure to import the CSS in your application:

```jsx
// In your main application file (e.g., App.js or index.js)
import 'react-cron-field/dist/styles.css';
```

## Basic Configuration

The CronInput component accepts several props for customization:

```jsx
<CronInput 
  value={cronExpression} 
  onChange={setCronExpression}
  placeholder="Select schedule"
  layout="natural"  // 'cron-native' or 'natural'
  showSeconds={false}  // Whether to show the seconds field (default: true)
  presets={[
    {
      label: "Every hour",
      value: "0 0 * * * *",
      description: "Runs every hour at minute 0",
    },
    // Add more presets as needed
  ]}
  theme={{
    baseColor: "bg-muted/30 dark:bg-muted/20",
    primaryColor: "bg-primary text-primary-foreground",
    secondaryColor: "bg-muted text-muted-foreground",
  }}
/>
```

## Using with AI-powered Cron Generation

React Cron Field supports AI-powered cron generation. You need to provide a function that converts natural language to cron expressions:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function ScheduleComponent() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  // Function to convert natural language to cron expressions
  const promptToCron = async (prompt) => {
    // Example implementation - replace with your own API call
    try {
      const response = await fetch('https://your-api-endpoint.com/generate-cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      return data.cronExpression;
    } catch (error) {
      console.error('Error generating cron expression:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Schedule Configuration</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression}
        promptToCron={promptToCron}
      />
      <p>Current cron expression: {cronExpression}</p>
    </div>
  );
}

export default ScheduleComponent;
```

## Next Steps

- Check out the [Components](./components.md) documentation for detailed information about all components
- See the [API Reference](./api-reference.md) for a complete list of props and methods
- Explore [Examples](./examples.md) for more usage patterns
