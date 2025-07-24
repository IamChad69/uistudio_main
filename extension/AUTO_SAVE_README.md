# Auto-Save Functionality

This document explains how to use the auto-save functionality in the UI Scraper extension.

## Overview

The auto-save feature allows scraped code to be automatically saved to the user's projects when enabled. It uses the existing `/api/extension/generate` endpoint to create projects and trigger the Inngest function for code generation.

## Components

### 1. AutoSaveManager (`src/utils/autoSave.ts`)

A singleton class that manages auto-save functionality:

```typescript
import { autoSaveManager } from "../utils/autoSave";

// Check if auto-save is enabled
const isEnabled = await autoSaveManager.isAutoSaveEnabled();

// Trigger auto-save with scraped code
const success = await autoSaveManager.triggerAutoSave({
  scrapedCode: "your scraped code here",
  context: "Optional context about the scrape",
});

// Store code for later auto-save
await autoSaveManager.storePendingCode("code to save later");

// Clear pending code
await autoSaveManager.clearPendingCode();
```

### 2. useAutoSave Hook (`src/hooks/useAutoSave.ts`)

A React hook for components that need auto-save functionality:

```typescript
import { useAutoSave } from "../hooks/useAutoSave";

const MyComponent = () => {
  const { triggerAutoSave, storePendingCode, isAutoSaveEnabled } =
    useAutoSave();

  const handleSave = async () => {
    const success = await triggerAutoSave(scrapedCode, "Context");
    if (success) {
      console.log("Saved successfully!");
    }
  };
};
```

### 3. WorkflowSettings Integration

The `WorkflowSettings` component now includes auto-save toggle functionality. When enabled, it automatically checks for pending scraped code and saves it.

## Usage Examples

### Basic Auto-Save

```typescript
import { autoSaveManager } from "../utils/autoSave";

// When scraping is complete
const scrapedCode = "..."; // Your scraped code
const success = await autoSaveManager.triggerAutoSave({
  scrapedCode,
  context: `Scraped from ${window.location.href}`,
});
```

### Store for Later

```typescript
// If auto-save is disabled, store for later
if (!(await autoSaveManager.isAutoSaveEnabled())) {
  await autoSaveManager.storePendingCode(scrapedCode);
}
```

### React Component Integration

```typescript
import { useAutoSave } from "../hooks/useAutoSave";

const ScrapingComponent = () => {
  const { triggerAutoSave } = useAutoSave();

  const handleScrapingComplete = async (scrapedCode: string) => {
    await triggerAutoSave(scrapedCode, "Scraped component");
  };
};
```

## Integration with UIScraper

The `UIScraper` class has been updated to automatically use auto-save when scraping elements. The `saveAsComponent` method now:

1. Checks if auto-save is enabled
2. If enabled, triggers auto-save with the scraped code
3. If disabled or fails, stores the code as pending
4. Shows appropriate notifications to the user

## API Endpoint

The auto-save functionality uses the existing `/api/extension/generate` endpoint:

- **URL**: `/api/extension/generate`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "value": "Auto-saved scraped code:\n\n[scraped code here]",
    "token": "extension_auth_token"
  }
  ```

## Storage Keys

The auto-save functionality uses these Chrome storage keys:

- `auto_save_results`: Boolean flag for auto-save setting
- `pendingScrapedCode`: String containing code to be saved later

## Error Handling

The auto-save system includes comprehensive error handling:

- Authentication failures
- Network errors
- Storage errors
- API errors

All errors are logged and appropriate user feedback is provided.

## Testing

Use the `AutoSaveExample` component to test auto-save functionality:

```typescript
import AutoSaveExample from '../_components/AutoSaveExample';

// In your component
<AutoSaveExample scrapedCode={yourScrapedCode} />
```

## Configuration

Auto-save can be configured in the WorkflowSettings component:

1. Navigate to Settings
2. Find the "Auto-save results" toggle
3. Enable/disable as needed

When enabled, any pending scraped code will be automatically saved.
