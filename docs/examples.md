# Examples

This document provides examples of how to use the React Cron Field library in different scenarios.

## Basic Usage

The simplest way to use the CronInput component:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function BasicExample() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  return (
    <div>
      <h2>Basic Cron Input</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression} 
      />
      <p>Current cron expression: {cronExpression}</p>
    </div>
  );
}
```

## Using Natural Layout

The CronInput component supports a "natural" layout that presents fields in a more intuitive order:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function NaturalLayoutExample() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  return (
    <div>
      <h2>Natural Layout</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression} 
        layout="natural"
      />
      <p>Current cron expression: {cronExpression}</p>
    </div>
  );
}
```

## Custom Presets

You can provide custom presets for common cron expressions:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function CustomPresetsExample() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  const customPresets = [
    {
      label: 'Every hour',
      value: '0 0 * * * *',
      description: 'Runs every hour at minute 0',
    },
    {
      label: 'Every day at noon',
      value: '0 0 12 * * *',
      description: 'Runs once a day at 12:00 PM',
    },
    {
      label: 'Weekends at 10 AM',
      value: '0 0 10 * * SAT,SUN',
      description: 'Runs Saturday and Sunday at 10:00 AM',
    },
    {
      label: 'First Monday of the month',
      value: '0 0 9 ? * 2#1',
      description: 'Runs at 9:00 AM on the first Monday of every month',
    },
  ];

  return (
    <div>
      <h2>Custom Presets</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression} 
        presets={customPresets}
      />
      <p>Current cron expression: {cronExpression}</p>
    </div>
  );
}
```

## Custom Theming

You can customize the appearance of the component using the theme prop:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function CustomThemeExample() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  const customTheme = {
    baseColor: 'bg-blue-100 dark:bg-blue-900',
    primaryColor: 'bg-blue-500 text-white',
    secondaryColor: 'bg-blue-200 text-blue-800',
  };

  return (
    <div>
      <h2>Custom Theme</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression} 
        theme={customTheme}
      />
      <p>Current cron expression: {cronExpression}</p>
    </div>
  );
}
```

## AI-powered Cron Generation

You can enable AI-powered cron generation by providing a `promptToCron` function:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function AIGenerationExample() {
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
      <h2>AI-powered Cron Generation</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression}
        promptToCron={promptToCron}
      />
      <p>Current cron expression: {cronExpression}</p>
    </div>
  );
}
```

## Form Integration

You can integrate the CronInput component with form libraries like Formik or React Hook Form:

### With Formik

```jsx
import React from 'react';
import { Formik, Form, Field } from 'formik';
import { CronInput } from 'react-cron-field';

function FormikExample() {
  const initialValues = {
    name: '',
    cronExpression: '0 0 * * * *',
  };

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    // Submit the form data
  };

  return (
    <div>
      <h2>Formik Integration</h2>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor="name">Task Name</label>
              <Field name="name" type="text" />
            </div>

            <div>
              <label htmlFor="cronExpression">Schedule</label>
              <CronInput 
                value={values.cronExpression} 
                onChange={(value) => setFieldValue('cronExpression', value)} 
              />
            </div>

            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
```

### With React Hook Form

```jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CronInput } from 'react-cron-field';

function ReactHookFormExample() {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      name: '',
      cronExpression: '0 0 * * * *',
    },
  });

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Submit the form data
  };

  const currentCron = watch('cronExpression');

  return (
    <div>
      <h2>React Hook Form Integration</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Task Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <input {...field} />}
          />
        </div>

        <div>
          <label htmlFor="cronExpression">Schedule</label>
          <Controller
            name="cronExpression"
            control={control}
            render={({ field }) => (
              <CronInput 
                value={field.value} 
                onChange={field.onChange} 
              />
            )}
          />
        </div>

        <p>Current cron expression: {currentCron}</p>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
```

## Using Utility Functions

You can use the utility functions provided by the library to work with cron expressions:

```jsx
import React, { useState } from 'react';
import { 
  parseCronExpression, 
  formatCronExpression, 
  describeCronExpression, 
  validateCronExpression 
} from 'react-cron-field';

function UtilityFunctionsExample() {
  const [cronExpression, setCronExpression] = useState('0 0 9 * * MON-FRI');

  // Parse the cron expression
  const parsed = parseCronExpression(cronExpression);

  // Modify a part of the cron expression
  const handleChangeHour = (hour) => {
    const newParsed = { ...parsed, hour };
    const newExpression = formatCronExpression(newParsed);
    setCronExpression(newExpression);
  };

  // Get a human-readable description
  const description = describeCronExpression(cronExpression);

  // Validate the cron expression
  const validation = validateCronExpression(cronExpression);

  return (
    <div>
      <h2>Utility Functions</h2>
      <div>
        <p>Current cron expression: {cronExpression}</p>
        <p>Description: {description}</p>
        <p>Valid: {validation.isValid ? 'Yes' : 'No'}</p>
        {!validation.isValid && <p>Error: {validation.error}</p>}

        <div>
          <h3>Parsed Expression:</h3>
          <pre>{JSON.stringify(parsed, null, 2)}</pre>
        </div>

        <div>
          <h3>Change Hour:</h3>
          <select 
            value={parsed.hour} 
            onChange={(e) => handleChangeHour(e.target.value)}
          >
            <option value="*">Every hour</option>
            <option value="9">9 AM</option>
            <option value="12">12 PM</option>
            <option value="15">3 PM</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

## Hiding Seconds Field

You can hide the seconds field in the cron expression builder by setting the `showSeconds` prop to `false`:

```jsx
import React, { useState } from 'react';
import { CronInput } from 'react-cron-field';

function HideSecondsExample() {
  const [cronExpression, setCronExpression] = useState('0 0 * * * *');

  return (
    <div>
      <h2>Hide Seconds Field</h2>
      <CronInput 
        value={cronExpression} 
        onChange={setCronExpression} 
        showSeconds={false}
      />
      <p>Current cron expression: {cronExpression}</p>
      <p>Note: When seconds are hidden, they are automatically set to "0" in the cron expression.</p>
    </div>
  );
}
```

When `showSeconds` is set to `false`:
1. The seconds field is not displayed in the builder interface
2. The seconds value is automatically set to "0" in the cron expression
3. The grid layout adjusts to accommodate the removal of the seconds field

This is useful for applications where second-level precision is not needed or when you want to simplify the interface for users.

## Next Steps

- See the [API Reference](./api-reference.md) for a complete list of props and methods
- Learn more about [Cron Syntax](./cron-syntax.md) and how it's used in this library
