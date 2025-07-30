// src/constants/messages.ts

// Actions for messages sent to content scripts
export const FONT_INSPECTION_ACTION = "startFontInspection";
export const TOGGLE_COLOR_PICKER_ACTION = "toggleColorPicker";
export const TOGGLE_SCRAPING_ACTION = "toggleScraping";
export const SHOW_EXTENSION_ACTION = "showExtension";
export const HIDE_EXTENSION_ACTION = "hideExtension"; // New action for explicit hide
export const DOWNLOAD_ASSET_ACTION = "downloadAsset";

// Actions for messages received from content scripts
export const EXTENSION_UI_CLOSED_ACTION = "extensionUIClosed";
export const EXTENSION_UI_SHOWN_ACTION = "extensionUIShown";

// Message types for external communication (e.g., web app auth)
export const AUTH_TOKEN_MESSAGE_TYPE = "AUTH_TOKEN";
