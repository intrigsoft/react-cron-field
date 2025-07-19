import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

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
  dependencies: packageJson.dependencies,
  keywords: packageJson.keywords,
  author: packageJson.author,
  license: packageJson.license,
};

// Write the modified package.json to the dist directory
fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(distPackageJson, null, 2)
);

// Copy README.md to dist directory if it exists
const readmePath = path.join(rootDir, 'README.md');
if (fs.existsSync(readmePath)) {
  fs.copyFileSync(readmePath, path.join(distDir, 'README.md'));
}

// Copy LICENSE to dist directory if it exists
const licensePath = path.join(rootDir, 'LICENSE');
if (fs.existsSync(licensePath)) {
  fs.copyFileSync(licensePath, path.join(distDir, 'LICENSE'));
}

console.log('Package files prepared for distribution.');
