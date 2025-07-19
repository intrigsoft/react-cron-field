import type { Preview } from '@storybook/react';
import ReactDOM from 'react-dom';
import '../src/globals.css';
import '../src/standalone.css';

// Define interfaces for the React 18+ root container
interface ReactRoot {
  unmount: () => void;
  render: (element: React.ReactNode) => void;
}

interface ReactContainer extends Element {
  _reactRootContainer?: ReactRoot;
}

// Polyfill for ReactDOM.unmountComponentAtNode which was removed in React 19
const unmountPolyfill = function(container: Element) {
  // Use the root API if available (React 18+)
  const reactContainer = container as ReactContainer;
  if (reactContainer._reactRootContainer) {
    const root = reactContainer._reactRootContainer;
    if (typeof root.unmount === 'function') {
      root.unmount();
      return true;
    }
  }
  return false;
};

// Polyfill for ReactDOM.render which was removed in React 19
const renderPolyfill = function(
  element: React.ReactNode,
  container: Element,
  callback?: () => void
) {
  // Clean up any existing root
  const reactContainer = container as ReactContainer;
  if (reactContainer._reactRootContainer) {
    const root = reactContainer._reactRootContainer;
    if (typeof root.unmount === 'function') {
      root.unmount();
    }
  }

  // Create a new root and render
  if (ReactDOM.createRoot) {
    const root = ReactDOM.createRoot(container);
    reactContainer._reactRootContainer = root as unknown as ReactRoot;
    root.render(element);

    // Execute callback if provided
    if (typeof callback === 'function') {
      callback();
    }
  }

  return null;
};

// Add the polyfills to ReactDOM
if (!ReactDOM.unmountComponentAtNode) {
  ReactDOM.unmountComponentAtNode = unmountPolyfill;
}

if (!ReactDOM.render && ReactDOM.createRoot) {
  ReactDOM.render = renderPolyfill;
}

// Also add the polyfills to the default export for ESM imports
if (ReactDOM.default) {
  if (!ReactDOM.default.unmountComponentAtNode) {
    ReactDOM.default.unmountComponentAtNode = unmountPolyfill;
  }

  if (!ReactDOM.default.render && ReactDOM.default.createRoot) {
    ReactDOM.default.render = renderPolyfill;
  }
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      canvas: {
        style: { overflow: 'visible' },
      }
    }
  },
};

export default preview;
