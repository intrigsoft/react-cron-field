# Contributing to React Cron Field

Thank you for considering contributing to React Cron Field! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## How to Contribute

There are many ways to contribute to React Cron Field:

1. **Reporting Bugs**: If you find a bug, please create an issue with a detailed description of the problem, steps to reproduce, and your environment.
2. **Suggesting Enhancements**: If you have ideas for new features or improvements, please create an issue to discuss them.
3. **Pull Requests**: If you'd like to contribute code, please submit a pull request with your changes.

## Development Setup

To set up the project for local development:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/react-cron-field.git
   cd react-cron-field
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Run Storybook to see the components in action:
   ```bash
   npm run storybook
   # or
   yarn storybook
   # or
   pnpm storybook
   ```

## Project Structure

The project is structured as follows:

- `src/`: Source code
  - `components/`: React components
    - `ui/`: UI components (buttons, inputs, etc.)
    - Other components specific to the cron field
  - `lib/`: Utility functions and helpers
  - `stories/`: Storybook stories
- `docs/`: Documentation
- `scripts/`: Build and utility scripts

## Development Guidelines

### Code Style

This project uses ESLint and Prettier for code formatting. Please ensure your code follows the project's style guidelines by running:

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

### TypeScript

This project is written in TypeScript. Please ensure all new code includes proper type definitions.

### Testing

Please write tests for your changes. You can run the tests with:

```bash
npm run test
# or
yarn test
# or
pnpm test
```

### Documentation

If you're adding new features or making significant changes, please update the documentation accordingly. The documentation is written in Markdown and is located in the `docs/` directory.

## Pull Request Process

1. Fork the repository and create a new branch for your changes.
2. Make your changes and ensure they pass all tests and lint checks.
3. Update the documentation if necessary.
4. Submit a pull request with a clear description of your changes.
5. Wait for a maintainer to review your pull request.

## Release Process

The release process is handled by the maintainers. If you're a maintainer, here's how to release a new version:

1. Update the version number in `package.json` according to [Semantic Versioning](https://semver.org/).
2. Update the CHANGELOG.md file with the changes in the new version.
3. Create a new release on GitHub with release notes.
4. Publish the new version to npm:
   ```bash
   npm publish
   # or
   yarn publish
   # or
   pnpm publish
   ```

## License

By contributing to React Cron Field, you agree that your contributions will be licensed under the project's MIT License.

## Questions?

If you have any questions about contributing, please create an issue or contact the maintainers.

Thank you for your contributions!