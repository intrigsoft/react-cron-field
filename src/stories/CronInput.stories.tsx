import type { Meta, StoryObj } from '@storybook/react';
import { CronInput } from '../components/cron-input';
import { CRON_PRESETS } from '../lib/cron-utils';

// Meta information for the component
const meta: Meta<typeof CronInput> = {
  title: 'Components/CronInput',
  component: CronInput,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'], // Removed to avoid conflict with MDX docs
  argTypes: {
    value: { control: 'text' },
    onChange: { action: 'changed' },
    placeholder: { control: 'text' },
    layout: { 
      control: { type: 'radio' }, 
      options: ['cron-native', 'natural'] 
    },
    showSeconds: { control: 'boolean' },
    presets: { control: 'object' },
    theme: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof CronInput>;

// Default story with default props
export const Default: Story = {
  args: {
    value: '0 0 * * * *',
    placeholder: 'Select cron expression',
  },
};

// Story with natural layout
export const NaturalLayout: Story = {
  args: {
    value: '0 0 * * * *',
    layout: 'natural',
    placeholder: 'Select cron expression',
  },
};

// Story with custom presets
export const CustomPresets: Story = {
  args: {
    value: '0 0 * * * *',
    presets: [
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
    ],
  },
};

// Story with custom theme
export const CustomTheme: Story = {
  args: {
    value: '0 0 * * * *',
    theme: {
      baseColor: 'bg-blue-100 dark:bg-blue-900',
      primaryColor: 'bg-blue-500 text-white',
      secondaryColor: 'bg-blue-200 text-blue-800',
    },
  },
};

// Story with all presets
export const AllPresets: Story = {
  args: {
    value: '0 0 * * * *',
    presets: CRON_PRESETS,
  },
};

// Story with initial complex expression
export const ComplexExpression: Story = {
  args: {
    value: '*/15 */2 1-15 * MON-FRI',
  },
};

// Story with seconds field hidden
export const HideSeconds: Story = {
  args: {
    value: '0 0 * * * *',
    showSeconds: false,
  },
};
