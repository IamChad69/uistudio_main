import React from "react";
import * as ReactDOMClient from "react-dom/client";
import browser from "webextension-polyfill";
import App, { AppProps } from "./App";
import { logger } from "../utils/logger";

// --- Main Content Script Class ---

class ContentScript {
  // private scraper!: UIScraper;
  // private fontInspector!: FontInspector;
  // private assetExtractor!: AssetExtractor;
  private isColorPickerActive: boolean = false;
  private reactRoot: ReactDOMClient.Root | null = null;
  private shadowHost: HTMLDivElement | null = null;
  // Store the App's toggle function once it's ready
  private appToggleSettings: (() => void) | null = null;
  // Store listeners for scraper state changes
  private stateChangeListeners: Set<(isActive: boolean) => void> = new Set();
  // Track if the extension UI is currently visible
  private isExtensionVisible: boolean = true;
  private isScrapingActive: boolean = false;
  private isInspectionActive: boolean = false;
  private isAssetExtractionActive: boolean = false;

  constructor() {
    if (window.self !== window.top) {
      logger.info("uiScraper: Running in iframe, skipping initialization.");
      return;
    }
    this.init();
  }

  private init(): void {
    logger.info(
      "🔍 uiScraper content script initializing - unified injector v2"
    );

    this.setupShadowDOM();

    // Initialize the scraper and set up its state change propagation
    // this.scraper = new UIScraper();
    // this.scraper.onStateChange((isActive) => {
    //   logger.info(`Scraper state changed: ${isActive}. Notifying listeners.`);
    //   this.stateChangeListeners.forEach((listener) => listener(isActive));
    // });

    //Initialize the font inspector
    // this.fontInspector = new FontInspector();

    // Initialize the asset extractor
    // this.assetExtractor = new AssetExtractor();

    // Render the React App if the shadow DOM was created successfully
    if (this.reactRoot) {
      this.renderReactApp();
    }

    this.setupMessageHandlers();
    this.setupKeyboardShortcuts();

    // Check for stored auth token on startup
    this.checkStoredAuthToken();

    logger.info("✅ uiScraper content script initialized successfully.");
  }

  private setupShadowDOM(): void {
    try {
      // Create the host element that will contain our shadow DOM
      this.shadowHost = document.createElement("div");
      this.shadowHost.id = "uiscraper-unified-root";

      // Position it fixed at top-right corner without affecting layout
      this.shadowHost.style.position = "fixed";
      this.shadowHost.style.top = "0";
      this.shadowHost.style.right = "0";
      this.shadowHost.style.zIndex = "2147483647"; // Maximum z-index
      this.shadowHost.style.width = "0";
      this.shadowHost.style.height = "0";
      this.shadowHost.style.overflow = "visible";
      this.shadowHost.style.pointerEvents = "none"; // Don't interfere with page clicks

      document.body.appendChild(this.shadowHost);

      // Create shadow root with open mode to allow external CSS
      const shadowRoot = this.shadowHost.attachShadow({ mode: "open" });

      // Basic CSS reset for shadow DOM
      const resetStyles = document.createElement("style");
      resetStyles.textContent = `
      /* Base styles for shadow DOM */
      :host {
        all: initial;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color-scheme: light dark;
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Basic resets for elements inside shadow DOM */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      /* App container styles */
      #uiscraper-app-container {
        position: absolute;
        top: 0;
        right: 0;
        pointer-events: auto;
        overflow: visible;
      }
      
      /* Make all interactive elements clickable by default */
      button, a, input, select, textarea, 
      label, [role="button"], [role="tab"], 
      [role="dialog"], [role="menu"], [tabindex] {
        pointer-events: auto !important;
        cursor: pointer;
      }
      
      /* Reset for specific elements */
      button {
        border: none;
        background: none;
      }
      
      a {
        text-decoration: none;
        color: inherit;
      }
      
      input, select, textarea {
        border: none;
        outline: none;
      }
      `;
      shadowRoot.appendChild(resetStyles);

      // Note: CSS is handled inline in the shadow DOM styles above
      // No external CSS file needed for content script

      // Create the container for our React app
      const appContainer = document.createElement("div");
      appContainer.id = "uiscraper-app-container";
      shadowRoot.appendChild(appContainer);

      // Create React root
      this.reactRoot = ReactDOMClient.createRoot(appContainer);
      logger.info("Shadow DOM and React root created successfully");
    } catch (error) {
      logger.error("Failed to setup Shadow DOM or React root:", error);
      if (this.shadowHost?.parentNode) {
        this.shadowHost.parentNode.removeChild(this.shadowHost);
      }
      this.shadowHost = null;
      this.reactRoot = null;
    }
  }

  private renderReactApp(): void {
    if (!this.reactRoot) {
      logger.error("Cannot render React app: Root not available.");
      return;
    }
    logger.info("Rendering React App (from App.tsx) into Shadow DOM");

    // Prepare props for the App component
    const appProps: AppProps = {
      getIsScrapingActive: () => this.isScrapingActive,
      onStartScraping: () => (this.isScrapingActive = true), // Regular extraction mode (false)
      onStartContextScraping: () => (this.isScrapingActive = true), // Context mode for AI chat (true)
      onStopScraping: () => (this.isScrapingActive = false),
      onClose: () => {
        logger.info("Closing extension UI via App close button");
        this.closeExtensionUI();
      },
      onAppReady: (toggleSettingsFunc: () => void) => {
        logger.info("App is ready, received toggleSettings function.");
        this.appToggleSettings = toggleSettingsFunc; // Store the function
      },
      onExternalScraperStateChange: (callback: (isActive: boolean) => void) => {
        logger.info("Registering external scraper state change listener");
        this.stateChangeListeners.add(callback);
        return () => {
          this.stateChangeListeners.delete(callback);
        };
      },
      onStartInspection: () => {
        logger.info("Starting inspection mode");
        //this.fontInspector.startInspection();
      },
      getIsInspectionActive: () => {
        return this.isInspectionActive;
      },
      onStartAssetExtraction: () => {
        logger.info("Starting asset extraction");
        //this.assetExtractor.startExtraction();
      },
      getIsAssetExtractionActive: () => {
        return this.isAssetExtractionActive;
      },
      onStartColorPicker: () => {
        logger.info("Starting color picker");
        this.startColorPicker();
      },
      getIsColorPickerActive: () => {
        return this.isColorPickerActive;
      },
    };

    // Render the App component with the prepared props
    this.reactRoot.render(React.createElement(App, appProps));
    logger.info("React App rendered into Shadow DOM");
  }

  private setupMessageHandlers(): void {
    browser.runtime.onMessage.addListener((message: unknown) => {
      logger.info("📨 Received message:", message);
      if (message && typeof message === "object" && "action" in message) {
        const action = (message as { action: string }).action;
        switch (action) {
          case "startScraping":
          case "stopScraping":
          case "toggleScraping":
            break;
          case "startFontInspection":
            logger.info("📨 Starting font inspection from background script");

            break;
          case "startAssetExtraction":
            logger.info("📨 Starting asset extraction from background script");

            break;
          case "toggleSettings":
            this.handleToggleSettings();
            break;
          case "toggleColorPicker":
            this.handleColorPickerAction(
              (message as { command?: string }).command || "toggle"
            );
            break;
          case "stopColorPicker":
            logger.info("📨 Stopping color picker from background script");
            this.stopColorPicker();
            break;
          case "closeExtension":
            this.closeExtensionUI();
            break;
          case "showExtension":
            logger.info("📨 Showing extension UI from background script");
            this.showExtensionUI();
            break;
          case "refreshAuth":
            this.refreshExtensionState();
            break;
          case "refreshExtensionState":
            logger.info("📨 Refreshing extension state from background script");
            this.refreshExtensionState();
            break;
          case "openCodeInEditor":
            logger.info("📨 Opening code in editor");
            this.handleOpenCodeInEditor(
              (message as { code?: string }).code || ""
            );
            break;
          default:
            logger.info(`📨 Unhandled message action: ${action}`);
        }
      } else {
        logger.warn("📨 Received unrecognized message format:", message);
      }
      return true; // Keep message channel open
    });

    // Listen for custom events from App component for color picker
    document.addEventListener("uiScraper:stopColorPicker", () => {
      logger.info("Received custom event to stop color picker");
      this.stopColorPicker();
    });
  }

  private handleToggleSettings(): void {
    logger.info("🔧 Handling toggleSettings message");
    if (this.appToggleSettings) {
      this.appToggleSettings(); // Call the function provided by App
    } else {
      logger.warn("Cannot toggle settings: App toggle function not ready.");
    }
  }

  private handleColorPickerAction(action: string): void {
    logger.info(`Handling color picker action: ${action}`);
    if (
      action === "start" ||
      (action === "toggle" && !this.isColorPickerActive)
    ) {
      this.startColorPicker();
    } else if (
      action === "stop" ||
      (action === "toggle" && this.isColorPickerActive)
    ) {
      this.stopColorPicker();
    }
  }

  private setupKeyboardShortcuts(): void {
    // Handle Alt+C for toggling scraping
    const handleAltC = (event: KeyboardEvent) => {
      const isAltKey = event.altKey;
      const isCKey =
        event.key === "c" ||
        event.key === "C" ||
        event.code === "KeyC" ||
        event.keyCode === 67;
      if (isAltKey && isCKey) {
        logger.info("⌨️ ALT+C detected, toggling scraping.");
        // if (this.scraper.getIsActive()) {
        //   this.scraper.stopScraping();
        // } else {
        //   this.scraper.startScraping();
        // }
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Handle Alt+F for font inspection
    const handleAltF = (event: KeyboardEvent) => {
      const isAltKey = event.altKey;
      const isFKey =
        event.key === "f" ||
        event.key === "F" ||
        event.code === "KeyF" ||
        event.keyCode === 70;
      if (isAltKey && isFKey) {
        logger.info("⌨️ ALT+F detected, starting font inspection.");
        // this.fontInspector.startInspection();
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Handle Alt+A for asset extraction
    const handleAltA = (event: KeyboardEvent) => {
      const isAltKey = event.altKey;
      const isAKey =
        event.key === "a" ||
        event.key === "A" ||
        event.code === "KeyA" ||
        event.keyCode === 65;
      if (isAltKey && isAKey) {
        logger.info("⌨️ ALT+A detected, starting asset extraction.");
        // this.assetExtractor.startExtraction();
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Add Alt+P shortcut for color picker
    const handleAltP = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "p") {
        logger.info("Alt+P shortcut detected - toggling color picker");
        event.preventDefault();
        this.handleColorPickerAction("toggle");
      }
    };

    // Add event listeners for all shortcuts
    const addEventListeners = (handler: (event: KeyboardEvent) => void) => {
      document.addEventListener("keydown", handler, { capture: true });
      window.addEventListener("keydown", handler, { capture: true });
      if (document.body) {
        document.body.addEventListener("keydown", handler, { capture: true });
      } else {
        window.addEventListener("DOMContentLoaded", () => {
          document.body?.addEventListener("keydown", handler, {
            capture: true,
          });
        });
      }
    };

    // Attach all handlers
    addEventListeners(handleAltC);
    addEventListeners(handleAltF);
    addEventListeners(handleAltA);
    addEventListeners(handleAltP);

    logger.info(
      "⌨️ Keyboard shortcuts initialized: Alt+C (toggle scraping), Alt+F (font inspection), Alt+A (asset extraction), Alt+P (color picker)"
    );
  }

  public cleanup(): void {
    logger.info("🧹 Cleaning up uiScraper content script");
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.shadowHost?.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost);
      this.shadowHost = null;
    }
    this.stateChangeListeners.clear();
    // TODO: Remove keydown listeners
  }

  // Handle color picker
  private startColorPicker(): void {
    logger.info("Starting color picker mode");
    //Stop scraping if active
    if (this.isScrapingActive) {
      this.isScrapingActive = false;
    }

    //Stop inspection if active
    if (this.isInspectionActive) {
      this.isInspectionActive = false;
    }

    //Stop asset extraction if active
    if (this.isAssetExtractionActive) {
      this.isAssetExtractionActive = false;
    }

    this.isColorPickerActive = true;

    // Notify listeners about state change
    this.stateChangeListeners.forEach((listener) => listener(false)); // Notify that scraping is off

    logger.info("Color picker mode activated");
  }

  private stopColorPicker(): void {
    logger.info("Stopping color picker mode");
    this.isColorPickerActive = false;
    logger.info("Color picker mode deactivated");
  }

  // Close the extension UI and stop any active tools
  private closeExtensionUI(): void {
    logger.info("Closing extension UI");

    //Stop any active tools
    if (this.isScrapingActive) {
      this.isScrapingActive = false;
    }

    if (this.isInspectionActive) {
      this.isInspectionActive = false;
    }

    //Check if asset extractor is active and has a stop method
    if (this.isAssetExtractionActive) {
      // If no stopExtraction method exists, we'll need an alternative approach
      // For now, we'll just log the issue as the extractor may not need explicit stopping
      logger.info("Asset extraction is active but no stop method available");
    }

    if (this.isColorPickerActive) {
      this.stopColorPicker();
    }

    // Hide the UI
    if (this.shadowHost) {
      this.shadowHost.style.display = "none";
      this.isExtensionVisible = false;
      logger.info("Extension UI hidden");

      // Notify background script that the UI is closed
      try {
        browser.runtime
          .sendMessage({ action: "extensionUIClosed" })
          .catch((err) =>
            logger.error("Error sending extensionUIClosed message:", err)
          );
      } catch (error) {
        logger.error(
          "Failed to notify background script of UI closure:",
          error
        );
      }
    }
  }

  // Show the extension UI if it was previously hidden
  private showExtensionUI(): void {
    logger.info("Showing extension UI");

    if (this.shadowHost && !this.isExtensionVisible) {
      this.shadowHost.style.display = "";
      this.isExtensionVisible = true;
      logger.info("Extension UI is now visible");

      // Notify background script that the UI is shown
      try {
        browser.runtime
          .sendMessage({ action: "extensionUIShown" })
          .catch((err) =>
            logger.error("Error sending extensionUIShown message:", err)
          );
      } catch (error) {
        logger.error(
          "Failed to notify background script of UI showing:",
          error
        );
      }
    }
  }

  // Refresh the extension state after authentication
  private refreshExtensionState(authToken?: string): void {
    logger.info("Refreshing extension state");

    try {
      // If we received an auth token, update the auth state
      if (authToken) {
        this.updateAuthState(authToken);
      } else {
        // If no auth token provided, this might be a logout - clear auth state
        this.clearAuthState();
      }

      // Re-render components to reflect new authentication state
      this.renderReactApp();

      // Show a success notification
      // showAuthNotification('Authentication successful!', true);

      // Acknowledge successful refresh
      logger.info("Extension state refreshed successfully");
    } catch (error) {
      logger.error("Error refreshing extension state:", error);
      // Try to recover gracefully
      //showNotification('Extension refresh failed. Please reload the page.', 'error');
    }
  }

  // Update authentication state
  private updateAuthState(token: string): void {
    try {
      // Store the token in local storage
      browser.storage.local.set({ auth_token: token }).then(() => {
        logger.info("Auth token stored in local storage");
      });

      // Update the auth state in the UI
      if (this.shadowHost) {
        const event = new CustomEvent("authStateChanged", {
          detail: { isAuthenticated: true, token },
        });
        this.shadowHost.dispatchEvent(event);
      }
    } catch (error) {
      logger.error("Error updating auth state:", error);
    }
  }

  // Clear authentication state
  private clearAuthState(): void {
    logger.info("Clearing authentication state");
    try {
      // Remove the token from local storage
      browser.storage.local.remove("auth_token").then(() => {
        logger.info("Auth token removed from local storage");
      });

      // Update the auth state in the UI
      if (this.shadowHost) {
        const event = new CustomEvent("authStateChanged", {
          detail: { isAuthenticated: false, token: null },
        });
        this.shadowHost.dispatchEvent(event);
      }
    } catch (error) {
      logger.error("Error clearing auth state:", error);
    }
  }

  // Check for stored auth token on startup
  private async checkStoredAuthToken(): Promise<void> {
    try {
      logger.info("🔍 Checking for stored auth token on startup...");
      // Type assertion to handle browser API type mismatch
      interface StorageResult {
        authToken?: string;
      }
      const result = (await browser.storage.local.get(
        "authToken"
      )) as StorageResult;

      if (result.authToken) {
        logger.info("🔍 Found stored auth token, refreshing auth state");
        this.refreshExtensionState(result.authToken);
      } else {
        logger.info("🔍 No stored auth token found on startup");
      }
    } catch (error) {
      logger.error("🔍 Error checking for stored auth token:", error);
    }
  }

  // Handle opening code in editor
  private handleOpenCodeInEditor(code: string): void {
    logger.info("🔍 Opening code in editor");

    // Check if we're on the uiscraper web app
    const isOnWebApp =
      window.location.href.includes("uiscraper") ||
      window.location.href.includes("localhost");

    if (isOnWebApp) {
      // Create a custom event to communicate with the web app
      const event = new CustomEvent("uiScraper:openInEditor", {
        detail: { code },
      });

      // Dispatch the event to the window
      window.dispatchEvent(event);
      logger.info("🔍 Dispatched openInEditor event to web app");
    } else {
      // If not on the web app, open a new tab to the web app with the code
      const encodedCode = encodeURIComponent(code);
      const webAppUrl = "https://uiscraper.com/sandbox?code=" + encodedCode;

      // Open in a new tab
      window.open(webAppUrl, "_blank");
      logger.info("🔍 Opened web app in new tab with code");
    }
  }
}

// Initialize ContentScript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const contentScriptInstance = new ContentScript();

export {};
