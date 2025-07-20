#!/bin/bash

# Define paths
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STORYBOOK_DIR="$ROOT_DIR/.storybook"
MANAGER_HEAD="$STORYBOOK_DIR/manager-head.html"
MANAGER_HEAD_DEV="$STORYBOOK_DIR/manager-head.dev.html"
MANAGER_HEAD_BUILD="$STORYBOOK_DIR/manager-head.build.html"

# Check if this is the first run and we need to create the build version
if [ ! -f "$MANAGER_HEAD_BUILD" ]; then
  # Create manager-head.build.html with base href tag
  cp "$MANAGER_HEAD" "$MANAGER_HEAD_BUILD"
  
  # Ensure it has the base href tag
  if ! grep -q "<base href=\"/react-cron-field/\"/>" "$MANAGER_HEAD_BUILD"; then
    echo "Adding base href tag to $MANAGER_HEAD_BUILD"
    # If there's no base href tag, add it after the title tag
    sed -i 's/<title>React Cron Field<\/title>/<title>React Cron Field<\/title>\n<base href="\/react-cron-field\/"\/>/g' "$MANAGER_HEAD_BUILD"
  fi
fi

# Check the mode parameter
MODE=$1

if [ "$MODE" == "dev" ]; then
  echo "Setting up Storybook for development mode"
  cp "$MANAGER_HEAD_DEV" "$MANAGER_HEAD"
elif [ "$MODE" == "build" ]; then
  echo "Setting up Storybook for build mode"
  cp "$MANAGER_HEAD_BUILD" "$MANAGER_HEAD"
else
  echo "Usage: $0 [dev|build]"
  exit 1
fi

echo "Storybook manager-head.html configured for $MODE mode"