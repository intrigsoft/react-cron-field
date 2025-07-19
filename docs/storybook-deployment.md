# Storybook Deployment to GitHub Pages

This document explains how the Storybook deployment to GitHub Pages is configured in this project.

## Configuration Overview

The project is set up to automatically deploy the Storybook to GitHub Pages whenever changes are pushed to the main branch. This is accomplished using GitHub Actions.

## How It Works

1. When code is pushed to the main branch, a GitHub Actions workflow is triggered
2. The workflow builds the Storybook static files
3. The static files are then deployed to GitHub Pages
4. The Storybook becomes available at `https://[your-github-username].github.io/react-cron-field/`

## Implementation Details

### GitHub Actions Workflow

The deployment is handled by a GitHub Actions workflow defined in `.github/workflows/deploy-storybook.yml`. This workflow:

- Runs on pushes to the main branch
- Can also be triggered manually from the Actions tab
- Sets up Node.js and installs dependencies
- Builds the Storybook using `npm run build-storybook`
- Deploys the built files to GitHub Pages

### GitHub Pages Setup

To complete the setup, you need to:

1. Go to your GitHub repository settings
2. Navigate to the "Pages" section
3. Under "Build and deployment", select "GitHub Actions" as the source
4. The first workflow run will create the GitHub Pages site

## Manual Deployment

You can also manually trigger the deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy Storybook to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch you want to deploy from (usually main)
5. Click "Run workflow" again

## Troubleshooting

If the deployment fails, check:

1. The GitHub Actions logs for any errors
2. That GitHub Pages is properly configured in your repository settings
3. That the repository has the necessary permissions to deploy to GitHub Pages

## Customization

If you need to customize the deployment:

- Edit the `.github/workflows/deploy-storybook.yml` file
- You can change the trigger branch, Node.js version, or other configuration options
- For advanced customization, refer to the [GitHub Actions documentation](https://docs.github.com/en/actions)