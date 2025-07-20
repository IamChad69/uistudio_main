#!/bin/bash

# Clean up any previous builds
rm -rf extension/chrome

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Build for Chrome
echo "Building extension for Chrome..."
pnpm run build:chrome

echo "Build completed! The extension can be found in extension/chrome"
echo "Load it in Chrome by going to chrome://extensions, enabling Developer Mode, and clicking 'Load unpacked'" 