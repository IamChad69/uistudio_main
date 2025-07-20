import browser from "webextension-polyfill";

// Track extension visibility state for each tab
const extensionVisibilityState: Record<number, boolean> = {};

// Define message types
interface AuthMessage {
  type: "AUTH_TOKEN";
  token: string;
}

interface PingMessage {
  type: "PING";
}

// Type guard for auth messages
const isAuthMessage = (message: unknown): message is AuthMessage => {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === "AUTH_TOKEN" &&
    "token" in message &&
    typeof message.token === "string"
  );
};

// Type guard for ping messages
const isPingMessage = (message: unknown): message is PingMessage => {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === "PING"
  );
};

// Listen for installation
browser.runtime.onInstalled.addListener((): void => {
  console.log("🔍 uiScraper extension installed");

  // Create context menu items
  browser.contextMenus.create({
    id: "uiscraper-inspect-font",
    title: "Inspect Font and Styles",
    contexts: ["page", "selection", "image", "link"],
  });

  // Add color picker context menu item
  browser.contextMenus.create({
    id: "uiscraper-color-picker",
    title: "Pick Color",
    contexts: ["page", "selection", "image", "link"],
  });
});

// Listen for context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "uiscraper-inspect-font" && tab?.id) {
    console.log("🔍 Font inspection requested via context menu");
    // Send message to content script to start font inspection
    await browser.tabs.sendMessage(tab.id, { action: "startFontInspection" });
  } else if (info.menuItemId === "uiscraper-color-picker" && tab?.id) {
    console.log("🔍 Color picker requested via context menu");
    // Send message to content script to start color picker
    await browser.tabs.sendMessage(tab.id, {
      action: "toggleColorPicker",
      command: "start",
    });
  }
});

// Listen for browser action click - can be used to toggle UI if needed
browser.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    const tabId = tab.id;

    // Check if we have the visibility state for this tab
    // If we don't have it stored or if the UI is hidden, show the extension
    if (extensionVisibilityState[tabId] === false) {
      console.log("🔍 Extension was closed, showing UI again");
      // Send message to show the extension
      await browser.tabs.sendMessage(tabId, { action: "showExtension" });
      extensionVisibilityState[tabId] = true;
    } else {
      console.log(
        "🔍 Extension icon clicked, but UI is already visible or state unknown"
      );
      // If we don't know the state, we don't do anything
      // This prevents toggling when the icon is clicked if extension is already visible
    }
  }
});

// Listen for keyboard shortcuts
browser.commands.onCommand.addListener(async (command) => {
  console.log("🔍 Command received:", command);

  // Get the active tab - common for all commands
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  console.log("🔍 Active tabs:", tabs.length);

  const activeTab = tabs[0];
  if (!activeTab || !activeTab.id) {
    console.error("🔍 No active tab found");
    return;
  }

  try {
    if (command === "toggle-scraping") {
      console.log("🔍 Processing toggle-scraping command");
      console.log("🔍 Sending toggleScraping message to tab:", activeTab.id);

      // Send toggle message to the content script
      const response = await browser.tabs.sendMessage(activeTab.id, {
        action: "toggleScraping",
      });
      console.log("🔍 Toggle response:", response);
    } else if (command === "start-font-inspection") {
      console.log("🔍 Processing start-font-inspection command");
      console.log(
        "🔍 Sending startFontInspection message to tab:",
        activeTab.id
      );

      // Send font inspection message to the content script
      const response = await browser.tabs.sendMessage(activeTab.id, {
        action: "startFontInspection",
      });
      console.log("🔍 Font inspection response:", response);
    } else if (command === "start-color-picker") {
      console.log("🔍 Processing start-color-picker command");
      console.log("🔍 Sending toggleColorPicker message to tab:", activeTab.id);

      // Send color picker message to the content script
      const response = await browser.tabs.sendMessage(activeTab.id, {
        action: "toggleColorPicker",
        command: "toggle",
      });
      console.log("🔍 Color picker response:", response);
    }
  } catch (error) {
    console.error("🔍 Error sending message:", error);
  }
});

// Define the expected message structure
interface ExtensionMessage {
  action: string;
  data?: Record<string, unknown>;
  code?: string; // For openInEditor and saveCode actions
  metadata?: {
    fileName: string;
    description: string;
    timestamp: string;
  }; // For saveCode action
}

// Listen for messages from content script
browser.runtime.onMessage.addListener(
  (message: unknown, sender: browser.Runtime.MessageSender) => {
    // Type guard to check if message matches our expected structure
    const isExtensionMessage = (msg: unknown): msg is ExtensionMessage =>
      msg !== null &&
      typeof msg === "object" &&
      "action" in (msg as Record<string, unknown>);

    // Safely cast message if it passes our type guard
    if (isExtensionMessage(message)) {
      // Track extension closed state
      if (message.action === "extensionUIClosed" && sender.tab?.id) {
        console.log("🔍 Extension UI closed in tab:", sender.tab.id);
        extensionVisibilityState[sender.tab.id] = false;
      }

      // Track extension shown state
      if (message.action === "extensionUIShown" && sender.tab?.id) {
        console.log("🔍 Extension UI shown in tab:", sender.tab.id);
        extensionVisibilityState[sender.tab.id] = true;
      }

      // Handle open in editor action
      if (message.action === "openInEditor" && message.code) {
        console.log("🔍 Opening code in editor");

        // Get the app URL from environment config
        import("../config/environment")
          .then((envModule) => {
            const config = envModule.default;
            const sandboxUrl = `${config.APP_URL}/sandbox`;

            // Make sure code is defined and encode it for URL transmission
            const codeToSend = message.code || "";
            const encodedCode = encodeURIComponent(codeToSend);

            // Create a new tab with the sandbox URL and the code as a parameter
            browser.tabs
              .create({
                url: `${sandboxUrl}?code=${encodedCode}`,
              })
              .then(() => {
                console.log("🔍 Opened sandbox with code in new tab");
              })
              .catch((err) => {
                console.error("Error opening sandbox tab:", err);
              });
          })
          .catch((err) => {
            console.error("Error importing environment config:", err);
          });

        return true;
      }

      // Handle save code action
      if (message.action === "saveCode" && message.code) {
        console.log("🔍 Saving code to storage");

        // Extract metadata if available
        const metadata = message.metadata || {
          fileName: "snippet.js",
          description: "Code snippet",
          timestamp: new Date().toISOString(),
        };

        // Generate a unique ID for the saved code
        const codeId = `code_${Date.now()}`;

        // Define the type for saved code
        interface SavedCodeItem {
          id: string;
          code: string;
          fileName: string;
          description: string;
          timestamp: string;
          [key: string]: any;
        }

        // Create the storage object
        const codeData = {
          id: codeId,
          code: message.code,
          ...metadata,
        };

        // Save to browser storage
        browser.storage.local
          .get("savedCode")
          .then((result: { savedCode?: SavedCodeItem[] }) => {
            const savedCode: SavedCodeItem[] = result.savedCode || [];
            savedCode.push(codeData as SavedCodeItem);

            return browser.storage.local.set({ savedCode });
          })
          .then(() => {
            console.log("🔍 Code saved successfully");

            // Notify the user that the code was saved
            browser.notifications.create({
              type: "basic",
              iconUrl: browser.runtime.getURL("icons/icon-48.png"),
              title: "Code Saved",
              message: `${metadata.fileName} has been saved to your library`,
            });
          })
          .catch((err) => {
            console.error("Error saving code:", err);
          });
      }

      return true; // Indicate we'll respond asynchronously
    }

    return true;
  }
);

// Clean up visibility state when tabs are closed
browser.tabs.onRemoved.addListener((tabId) => {
  if (extensionVisibilityState[tabId] !== undefined) {
    delete extensionVisibilityState[tabId];
    console.log("🔍 Cleaned up state for closed tab:", tabId);
  }
});

// Define interface for auth API response
interface AuthApiResponse {
  status: number;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message?: string;
}

// Function to handle web app authentication
const handleWebAppAuth = async (token: string): Promise<AuthApiResponse> => {
  try {
    // Import environment config
    const envModule = await import("../config/environment");
    const config = envModule.default;

    // API endpoint for auth verification
    const verifyEndpoint = `${config.API_URL}/api/auth/verify`;

    // Make API request to verify token
    const response = await fetch(verifyEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Parse response
    const data = await response.json();

    return {
      status: response.status,
      user: data.user,
      message: data.message,
    };
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return {
      status: 500,
      message: "Internal error verifying token",
    };
  }
};

// Listen for messages from the web app
browser.runtime.onMessageExternal.addListener(
  (message: unknown, sender, sendResponse) => {
    console.log("🔍 Received external message:", message);
    console.log("🔍 From sender:", sender);
    console.log("🔍 Extension ID:", browser.runtime.id); // Log the actual extension ID

    // Handle ping messages for connection testing
    if (isPingMessage(message)) {
      console.log("🔍 Received ping from external source:", sender.url);
      sendResponse({ success: true, message: "Extension is available" });
      return true;
    }

    if (isAuthMessage(message)) {
      console.log("🔍 Processing auth token...");
      console.log("🔍 Token length:", message.token.length);

      // Store the token first, then try to verify it
      chrome.storage.local.set({ authToken: message.token }, () => {
        console.log("🔍 Auth token stored in local storage directly");

        // Now attempt the API verification
        handleWebAppAuth(message.token)
          .then((result: AuthApiResponse) => {
            console.log("🔍 Auth result:", result);
            if (result.status === 200 && result.user) {
              console.log("🔍 User authenticated:", {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
              });
              sendResponse({ success: true });
            } else {
              console.error("🔍 Auth failed with status:", result.status);
              // Even if verification fails, we still stored the token
              sendResponse({
                success: true,
                message: "Token stored but verification failed",
              });
            }
          })
          .catch((error: Error) => {
            console.error("🔍 Error handling auth token:", error);
            // Even if verification fails, we still stored the token
            sendResponse({
              success: true,
              message: "Token stored but API error occurred",
            });
          });
      });

      return true; // Keep the message channel open for async response
    }

    sendResponse({ success: false, message: "Unknown message type" });
    return true; // Always return true to indicate we handled the message
  }
);

// Make the extension available in service worker contexts
if (typeof self !== "undefined") {
  // Service worker activation
  self.addEventListener("activate", () => {
    console.log("Service worker activated");
  });

  // Message handling
  self.addEventListener("message", (event) => {
    console.log("Message received in service worker:", event.data);
  });
}

export {};
