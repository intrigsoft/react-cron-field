#!/bin/bash

# Define paths
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

# Ensure dist directory exists
mkdir -p "$DIST_DIR"

# Create a modified package.json for distribution
node -e "
const fs = require('fs');
const path = require('path');

const rootDir = '$ROOT_DIR';
const distDir = '$DIST_DIR';

// Read the original package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

// Create a modified package.json for distribution
const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  type: packageJson.type,
  main: './react-cron-field.umd.cjs',
  module: './react-cron-field.js',
  types: './index.d.ts',
  exports: {
    '.': {
      types: './index.d.ts',
      import: './react-cron-field.js',
      require: './react-cron-field.umd.cjs'
    },
    './style.css': './react-cron-field.css'
  },
  peerDependencies: packageJson.peerDependencies,
  dependencies: (() => {
    // Filter out tailwind-related dependencies
    const deps = { ...packageJson.dependencies };
    delete deps['tailwind-merge'];
    delete deps['tailwindcss-animate'];
    return deps;
  })(),
  keywords: packageJson.keywords,
  author: packageJson.author,
  license: packageJson.license,
};

// Write the modified package.json to the dist directory
fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(distPackageJson, null, 2)
);
"

# Copy README.md to dist directory if it exists
if [ -f "$ROOT_DIR/README.md" ]; then
  cp "$ROOT_DIR/README.md" "$DIST_DIR/README.md"
fi

# Copy LICENSE to dist directory if it exists
if [ -f "$ROOT_DIR/LICENSE" ]; then
  cp "$ROOT_DIR/LICENSE" "$DIST_DIR/LICENSE"
fi

echo "Package files prepared for distribution."
