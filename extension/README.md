# uiScraper Browser Extension

<p align="center">A cross-browser web scraping tool for extracting UI elements and data from websites.</p>

## Features

- 🌐 Works on Chrome, Firefox, Opera, and Edge
- 📊 Extract structured data from any website
- 🔍 Powerful selector engine for precise targeting
- 💾 Export data in various formats (JSON, CSV, etc.)
- 🛠 Customizable scraping configurations
- 🚀 Fast and efficient data extraction
- 🔄 Real-time updates and live preview

## Browser Support

| [![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](/) | [![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](/) | [![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)](/) | [![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](/) |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 88 & later ✔                                                                                  | 78 & later ✔                                                                                     | 74 & later ✔                                                                               | 88 & later ✔                                                                            |

## Development

### Prerequisites

Ensure you have:
- [Node.js](https://nodejs.org) 14 or later installed
- [pnpm](https://pnpm.io/) 6 or later installed

### Getting Started

1. Clone the repository
```
git clone https://github.com/uiScraper/uiScraper.git
cd uiScraper/apps/extension
```

2. Install dependencies
```
pnpm install
```

3. Start the development server
```
# For Chrome
pnpm run dev:chrome

# For Firefox
pnpm run dev:firefox

# For Opera
pnpm run dev:opera

# For Edge
pnpm run dev:edge
```

### Loading the Extension in Browsers

#### Chrome / Edge / Brave
1. Navigate to `chrome://extensions` (or edge://extensions)
2. Enable "Developer Mode"
3. Click "Load Unpacked"
4. Select the `extension/chrome` directory

#### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file in the `extension/firefox` directory

#### Opera
1. Navigate to `opera:extensions`
2. Enable "Developer Mode"
3. Click "Load Unpacked"
4. Select the `extension/opera` directory

### Building for Production

To build all browser versions at once:
```
pnpm run build
```

For specific browsers:
```
pnpm run build:chrome
pnpm run build:firefox
pnpm run build:opera
pnpm run build:edge
```

The built extensions will be available in the `extension/[browser]` directory.

### Quick Build Script

For convenience, we've included a quick build script for Chrome:
```
chmod +x build.sh
./build.sh
```

## Usage

1. Click on the uiScraper icon in your browser's toolbar
2. Select elements on the page to scrape
3. Configure extraction settings
4. Extract data
5. Export to your preferred format

## Troubleshooting

### ESLint Issues
If you encounter ESLint errors related to formatting, you can:

1. Add problematic files to the `.eslintignore` file
2. Run `pnpm lint:fix` to automatically fix formatting issues
3. If linting is preventing the build, use `NODE_ENV=production` when building

### TypeScript Errors
If you encounter TypeScript errors:

1. Make sure you have `@types/chrome` installed: `pnpm install @types/chrome --save-dev`
2. Use appropriate imports for browser APIs:
   - For cross-browser compatibility: `import browser from 'webextension-polyfill';`
   - For Chrome-specific APIs: Use the global `chrome` namespace

### Manifest V3 Issues
If you encounter issues with background scripts in Manifest V3:

1. Ensure background scripts have an export statement: `export {};`
2. Don't declare global variables like `self` which are already in scope
3. Wrap service worker code in a check: `if (typeof self !== 'undefined')`

## License

MIT
