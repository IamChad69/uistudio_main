// src/background.ts
import browser from "webextension-polyfill";
import { handleWebAppAuth } from "../actions/auth"; // Assuming this path is correct

import {
  AUTH_TOKEN_MESSAGE_TYPE,
  FONT_INSPECTION_ACTION,
  TOGGLE_COLOR_PICKER_ACTION,
  TOGGLE_SCRAPING_ACTION,
  SHOW_EXTENSION_ACTION,
  HIDE_EXTENSION_ACTION,
  EXTENSION_UI_CLOSED_ACTION,
  EXTENSION_UI_SHOWN_ACTION,
  DOWNLOAD_ASSET_ACTION,
} from "../constants/messages";

import {
  INSPECT_FONT_MENU_ID,
  COLOR_PICKER_MENU_ID,
  DOWNLOAD_ASSET_MENU_ID,
} from "../constants/menuItems";
import {
  TOGGLE_SCRAPING_COMMAND,
  START_FONT_INSPECTION_COMMAND,
  START_COLOR_PICKER_COMMAND,
} from "../constants/commands";

// Track extension UI visibility state for each tab
// Value is `true` if visible, `false` if closed by content script, `undefined` if unknown.
const extensionVisibilityState: Record<number, boolean | undefined> = {};

// Define message types and type guards
interface AuthMessage {
  type: typeof AUTH_TOKEN_MESSAGE_TYPE;
  token: string;
}

// Type guard for auth messages
const isAuthMessage = (message: unknown): message is AuthMessage => {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    (message as { type: unknown }).type === AUTH_TOKEN_MESSAGE_TYPE &&
    "token" in message &&
    typeof (message as { token: unknown }).token === "string"
  );
};

// Define the expected internal message structure
interface ExtensionMessage {
  action: string;
  data?: Record<string, unknown>;
  command?: string; // For color picker toggle command
}

// Type guard for internal messages
const isExtensionMessage = (message: unknown): message is ExtensionMessage => {
  return (
    message !== null &&
    typeof message === "object" &&
    "action" in (message as Record<string, unknown>) &&
    typeof (message as { action: unknown }).action === "string"
  );
};

// --- Event Listeners ---

// Listen for extension installation
browser.runtime.onInstalled.addListener((): void => {
  console.log("[uiScraper] Extension installed");

  // Create context menu items
  browser.contextMenus.create({
    id: INSPECT_FONT_MENU_ID,
    title: "Font Inspector",
    contexts: ["page", "selection", "image", "link"],
  });

  browser.contextMenus.create({
    id: COLOR_PICKER_MENU_ID,
    title: "Color Picker",
    contexts: ["page", "selection", "image", "link"],
  });

  browser.contextMenus.create({
    id: DOWNLOAD_ASSET_MENU_ID,
    title: "Download Asset",
    contexts: ["page", "selection", "image", "link"],
  });
});

// Listen for context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) {
    console.warn("[uiScraper] Context menu click without valid tab ID.");
    return;
  }

  try {
    if (info.menuItemId === INSPECT_FONT_MENU_ID) {
      console.log("[uiScraper] Font inspection requested via context menu");
      await browser.tabs.sendMessage(tab.id, {
        action: FONT_INSPECTION_ACTION,
      });
    } else if (info.menuItemId === COLOR_PICKER_MENU_ID) {
      console.log("[uiScraper] Color picker requested via context menu");
      await browser.tabs.sendMessage(tab.id, {
        action: TOGGLE_COLOR_PICKER_ACTION,
        command: "start", // Explicitly start the picker
      });
    } else if (info.menuItemId === DOWNLOAD_ASSET_MENU_ID) {
      console.log("[uiScraper] Download asset requested via context menu");
      await browser.tabs.sendMessage(tab.id, {
        action: DOWNLOAD_ASSET_ACTION,
      });
    }
  } catch (error) {
    console.error("[uiScraper] Error sending message via context menu:", error);
  }
});

// Listen for browser action click (extension icon click)
browser.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    console.warn("[uiScraper] Browser action click without valid tab ID.");
    return;
  }

  const tabId = tab.id;
  const isVisible = extensionVisibilityState[tabId];

  try {
    if (isVisible === true) {
      console.log("[uiScraper] UI is visible, sending hideExtension message");
      // Send message to hide the extension UI
      await browser.tabs.sendMessage(tabId, { action: HIDE_EXTENSION_ACTION });
      extensionVisibilityState[tabId] = false; // Optimistically update state
    } else {
      console.log(
        "[uiScraper] UI is hidden or state unknown, sending showExtension message"
      );
      // Send message to show the extension UI
      await browser.tabs.sendMessage(tabId, { action: SHOW_EXTENSION_ACTION });
      extensionVisibilityState[tabId] = true; // Optimistically update state
    }
  } catch (error) {
    console.error("[uiScraper] Error toggling extension UI:", error);
    // If an error occurs, the state might not have updated on the content script side
    // It's safer to revert optimistic update or re-evaluate state. For now, log.
  }
});

// Listen for keyboard shortcuts
browser.commands.onCommand.addListener(async (command) => {
  console.log(`[uiScraper] Command received: ${command}`);

  // Get the active tab - common for all commands
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];

  if (!activeTab || !activeTab.id) {
    console.error("[uiScraper] No active tab found to send command to.");
    return;
  }

  try {
    let response;
    switch (command) {
      case TOGGLE_SCRAPING_COMMAND:
        console.log(
          `[uiScraper] Processing ${TOGGLE_SCRAPING_COMMAND} command for tab: ${activeTab.id}`
        );
        response = await browser.tabs.sendMessage(activeTab.id, {
          action: TOGGLE_SCRAPING_ACTION,
        });
        break;
      case START_FONT_INSPECTION_COMMAND:
        console.log(
          `[uiScraper] Processing ${START_FONT_INSPECTION_COMMAND} command for tab: ${activeTab.id}`
        );
        response = await browser.tabs.sendMessage(activeTab.id, {
          action: FONT_INSPECTION_ACTION,
        });
        break;
      case START_COLOR_PICKER_COMMAND:
        console.log(
          `[uiScraper] Processing ${START_COLOR_PICKER_COMMAND} command for tab: ${activeTab.id}`
        );
        response = await browser.tabs.sendMessage(activeTab.id, {
          action: TOGGLE_COLOR_PICKER_ACTION,
          command: "toggle", // Send 'toggle' command for keyboard shortcut
        });
        break;
      default:
        console.warn(`[uiScraper] Unrecognized command: ${command}`);
        return;
    }
    console.log(`[uiScraper] Response for ${command}:`, response);
  } catch (error) {
    console.error(
      `[uiScraper] Error sending command ${command} message to tab ${activeTab.id}:`,
      error
    );
  }
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener(
  async (message: unknown, sender: browser.Runtime.MessageSender) => {
    // Safely cast message if it passes our type guard
    if (isExtensionMessage(message)) {
      const tabId = sender.tab?.id;
      if (!tabId) {
        console.warn(
          "[uiScraper] Message from content script without valid tab ID."
        );
        return false; // Not expecting async response for malformed message
      }

      // Handle different actions
      switch (message.action) {
        case "createAuthTab":
          try {
            console.log("[uiScraper] Creating auth tab...");
            const url = (message as any).url;
            if (!url) {
              console.error("[uiScraper] No URL provided for auth tab");
              return { success: false, error: "No URL provided" };
            }

            const newTab = await browser.tabs.create({ url });
            console.log("[uiScraper] Auth tab created:", newTab.id);
            return { success: true, tabId: newTab.id };
          } catch (error) {
            console.error("[uiScraper] Error creating auth tab:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }

        case "closeTab":
          try {
            const tabIdToClose = (message as any).tabId;
            if (tabIdToClose) {
              await browser.tabs.remove(tabIdToClose);
              console.log("[uiScraper] Tab closed:", tabIdToClose);
            }
            return { success: true };
          } catch (error) {
            console.error("[uiScraper] Error closing tab:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }

        case "refreshExtensionState":
          try {
            console.log("[uiScraper] Refreshing extension state...");
            // Send message to all content scripts to refresh their state
            const tabs = await browser.tabs.query({});
            for (const tab of tabs) {
              if (tab.id) {
                try {
                  await browser.tabs.sendMessage(tab.id, {
                    action: "refreshExtensionState",
                  });
                } catch (error) {
                  // Ignore errors for tabs that don't have content scripts
                  console.debug(
                    `[uiScraper] Could not send message to tab ${tab.id}:`,
                    error
                  );
                }
              }
            }
            return { success: true };
          } catch (error) {
            console.error(
              "[uiScraper] Error refreshing extension state:",
              error
            );
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }

        case EXTENSION_UI_CLOSED_ACTION:
          console.log(`[uiScraper] Extension UI closed in tab: ${tabId}`);
          extensionVisibilityState[tabId] = false;
          return true;

        case EXTENSION_UI_SHOWN_ACTION:
          console.log(`[uiScraper] Extension UI shown in tab: ${tabId}`);
          extensionVisibilityState[tabId] = true;
          return true;

        default:
          console.warn(`[uiScraper] Unhandled action: ${message.action}`);
          return false;
      }
    }
    console.warn(
      "[uiScraper] Received unhandled or malformed internal message:",
      message
    );
    return false; // No async response expected for unhandled message
  }
);

// Clean up visibility state when tabs are closed
browser.tabs.onRemoved.addListener((tabId) => {
  if (extensionVisibilityState[tabId] !== undefined) {
    delete extensionVisibilityState[tabId];
    console.log(`[uiScraper] Cleaned up state for closed tab: ${tabId}`);
  }
});

// Listen for messages from the web app (external)
browser.runtime.onMessageExternal.addListener(
  (
    message: unknown,
    sender: browser.Runtime.MessageSender,
    sendResponse: (response: any) => void
  ): true => {
    console.log("[uiScraper] Received external message:", message);
    console.log("[uiScraper] From sender:", sender);
    console.log("[uiScraper] Message type check:", typeof message);
    console.log("[uiScraper] Is auth message:", isAuthMessage(message));
    console.log(
      "[uiScraper] Message keys:",
      message && typeof message === "object"
        ? Object.keys(message as object)
        : "Not an object"
    );

    if (isAuthMessage(message)) {
      console.log("[uiScraper] Processing auth token...");
      console.log("[uiScraper] Token received:", message.token ? "Yes" : "No");
      handleWebAppAuth(message.token)
        .then((result) => {
          console.log("[uiScraper] Auth result:", result);
          if (result.status === 200 && result.user) {
            console.log("[uiScraper] User authenticated:", {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
            });
          }
          sendResponse({ success: result.status === 200 });
        })
        .catch((error) => {
          console.error("[uiScraper] Error handling auth token:", error);
          sendResponse({ success: false, error: error.message }); // Send error message
        });
      return true; // Keep the message channel open for async response
    }

    console.warn("[uiScraper] Received unhandled external message:", message);
    sendResponse({ success: false, error: "Unhandled message type" });
    return true; // Always return true to indicate we handled the message
  }
);

// Make the extension available in service worker contexts (for Manifest V3)
if (
  typeof self !== "undefined" &&
  typeof (self as any).addEventListener === "function"
) {
  // Service worker activation: useful for one-time setup or migrations
  (self as any).addEventListener("activate", () => {
    console.log("[uiScraper] Service worker activated");
    // Example: Clean up old caches, migrate data
  });

  // Message handling for direct messages to the service worker (less common for most extensions)
  (self as any).addEventListener("message", (event: MessageEvent) => {
    console.log("[uiScraper] Message received in service worker:", event.data);
    // You could process messages here that don't need to be tied to a specific tab,
    // like background tasks, data synchronization, etc.
  });
}

// Export an empty object to satisfy TypeScript if no other exports are needed
export {};
