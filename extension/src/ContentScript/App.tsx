import React, { useState, useEffect, useCallback } from "react";
import FloatingButton from "../_components/MainButton/FloatingButton";
import ColorPicker from "../_components/Ui/ColorPicker";
import { FontInspectorUI } from "../_components/Ui/fontInspectorUi";
import { logger } from "../utils/logger";

// Add browser API declaration for cross-browser compatibility
declare const browser: typeof chrome;

export interface AppProps {
  getIsScrapingActive: () => boolean;
  onStartScraping: () => void;
  onStartContextScraping: () => void; // New prop for context scraping
  onStopScraping: () => void;
  onAppReady: (toggleSettings: () => void) => void;
  onExternalScraperStateChange: (
    callback: (isActive: boolean) => void
  ) => () => void; // Returns unsubscribe function
  onStartInspection: () => void; // Add this for font inspection
  onStopInspection?: () => void; // Add this for stopping font inspection
  getIsInspectionActive?: () => boolean; // Optional method to get inspection state
  onStartAssetExtraction?: () => void; // Add this for asset extraction
  getIsAssetExtractionActive?: () => boolean; // Optional method to get asset extraction state
  onStartColorPicker?: () => void; // Add this for color picker
  getIsColorPickerActive?: () => boolean; // Optional method to get color picker state
  onClose?: () => void; // Add handler for completely closing the extension UI
}

const App: React.FC<AppProps> = ({
  getIsScrapingActive,
  onStartScraping,
  onStartContextScraping,
  onStopScraping,
  onAppReady,
  onExternalScraperStateChange,
  onStartInspection,
  onStopInspection,
  getIsInspectionActive,
  onStartAssetExtraction,
  getIsAssetExtractionActive,
  onStartColorPicker,
  getIsColorPickerActive,
  onClose,
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isScrapingActive, setIsScrapingActive] = useState(
    getIsScrapingActive()
  );
  const [isInspectionActive, setIsInspectionActive] = useState(
    getIsInspectionActive ? getIsInspectionActive() : false
  );
  const [isAssetExtractionActive, setIsAssetExtractionActive] = useState(
    getIsAssetExtractionActive ? getIsAssetExtractionActive() : false
  );
  const [isColorPickerActive, setIsColorPickerActive] = useState(
    getIsColorPickerActive ? getIsColorPickerActive() : false
  );

  // Add debug logging for the main App component
  useEffect(() => {
    logger.info("App component mounted");
    logger.info(`Initial scraping state: ${isScrapingActive}`);
    logger.info(`Initial inspection state: ${isInspectionActive}`);
    logger.info(`Initial asset extraction state: ${isAssetExtractionActive}`);
    logger.info(`Initial color picker state: ${isColorPickerActive}`);

    // Log the DOM structure inside shadowRoot to debug rendering issues
    try {
      const rootElement = document.getElementById("uiscraper-app-container");
      if (rootElement) {
        logger.info("App container found in DOM");
        // Log its parent shadowRoot if it exists
        const hostElement = document.getElementById("uiscraper-unified-root");
        if (hostElement?.shadowRoot) {
          logger.info("Shadow root exists and is accessible");
        } else {
          logger.info("Shadow root not found or not accessible");
        }
      } else {
        logger.info("App container not found in DOM");
      }
    } catch (err) {
      logger.error("Error checking DOM structure:", err);
    }

    return () => {
      logger.info("App component unmounting");
    };
  }, [
    isScrapingActive,
    isInspectionActive,
    isAssetExtractionActive,
    isColorPickerActive,
  ]);

  // --- Settings Popup Logic ---
  const toggleSettingsPopup = useCallback(() => {
    console.log(
      "App: Toggling settings popup, current state:",
      !isSettingsVisible
    );
    logger.info("App: Toggling settings popup");
    setIsSettingsVisible((prev) => !prev);
  }, [isSettingsVisible]);

  // Pass the toggle function up to the ContentScript once available
  useEffect(() => {
    onAppReady(toggleSettingsPopup);
  }, [onAppReady, toggleSettingsPopup]);

  // --- Scraping Logic ---
  const handleStartScraping = useCallback(() => {
    logger.info("App: Triggering start scraping");
    onStartScraping();
    setIsScrapingActive(true);
  }, [onStartScraping]);

  const handleStartContextScraping = useCallback(() => {
    logger.info("App: Triggering context scraping for AI Chat");
    onStartContextScraping();
    setIsScrapingActive(true);
  }, [onStartContextScraping]);

  const handleStopScraping = useCallback(() => {
    logger.info("App: Triggering stop scraping");
    onStopScraping();
    setIsScrapingActive(false);
  }, [onStopScraping]);

  // Listen for external state changes (e.g., from keyboard shortcut)
  useEffect(() => {
    const unsubscribe = onExternalScraperStateChange((isActive) => {
      logger.info(`App: Received external scraper state update: ${isActive}`);
      setIsScrapingActive(isActive);
    });
    // Ensure initial state is correct after mounting
    setIsScrapingActive(getIsScrapingActive());
    return unsubscribe; // Cleanup listener
  }, [onExternalScraperStateChange, getIsScrapingActive]);

  // Handle UI Inspection
  const handleStartInspection = useCallback(() => {
    logger.info("App: Starting UI inspection");
    if (isScrapingActive) {
      // Stop scraping first if it's active
      onStopScraping();
      setIsScrapingActive(false);
    }
    onStartInspection();
    setIsInspectionActive(true);
  }, [isScrapingActive, onStopScraping, onStartInspection]);

  const handleStopInspection = useCallback(() => {
    logger.info("App: Stopping UI inspection");
    if (onStopInspection) {
      onStopInspection();
    }
    setIsInspectionActive(false);
  }, [onStopInspection]);

  // Handle Asset Extraction
  const handleStartAssetExtraction = useCallback(() => {
    logger.info("App: Starting asset extraction");
    if (isScrapingActive) {
      // Stop scraping first if it's active
      onStopScraping();
      setIsScrapingActive(false);
    }
    if (onStartAssetExtraction) {
      onStartAssetExtraction();
      setIsAssetExtractionActive(true);
    } else {
      logger.warn("App: Asset extraction function not provided");
    }
  }, [isScrapingActive, onStopScraping, onStartAssetExtraction]);

  // Handle Color Picker
  const handleStartColorPicker = useCallback(() => {
    logger.info("App: Starting color picker");
    if (isScrapingActive) {
      // Stop scraping first if it's active
      onStopScraping();
      setIsScrapingActive(false);
    }
    if (onStartColorPicker) {
      onStartColorPicker();
      setIsColorPickerActive(true);
    } else {
      logger.warn("App: Color picker function not provided");
    }
  }, [isScrapingActive, onStopScraping, onStartColorPicker]);

  const handleCloseColorPicker = useCallback(() => {
    logger.info("App: Closing color picker");

    // Update the UI state first
    setIsColorPickerActive(false);

    // Create a custom event to inform ContentScript to stop the color picker
    try {
      // We'll try to communicate with ContentScript in 3 ways:
      // 1. Dispatch a custom event
      const customEvent = new CustomEvent("uiScraper:stopColorPicker");
      document.dispatchEvent(customEvent);
      logger.info("App: Dispatched stopColorPicker event");

      // 2. Send message to background script
      try {
        browser.runtime
          .sendMessage({ action: "stopColorPicker" })
          .catch((err: Error) =>
            logger.error("Error sending stopColorPicker message:", err)
          );
      } catch (error) {
        logger.debug("App: Background messaging not available", error);
      }
    } catch (error) {
      logger.error("App: Error in handleCloseColorPicker:", error);
    }
  }, []);

  // Check inspection state when component mounts
  useEffect(() => {
    // Update state based on inspector's current state
    if (getIsInspectionActive) {
      setIsInspectionActive(getIsInspectionActive());
    }

    // Update state based on asset extractor's current state
    if (getIsAssetExtractionActive) {
      setIsAssetExtractionActive(getIsAssetExtractionActive());
    }

    // Check color picker state when component mounts
    if (getIsColorPickerActive) {
      setIsColorPickerActive(getIsColorPickerActive());
    }

    // Cleanup when component unmounts
    return () => {
      // Any cleanup needed
    };
  }, [
    getIsInspectionActive,
    getIsAssetExtractionActive,
    getIsColorPickerActive,
  ]);

  // Handle closing extension UI
  const handleClose = useCallback(() => {
    logger.info("App: Handling extension close request");

    // Clean up active state
    if (isScrapingActive) {
      onStopScraping();
    }

    // Hide everything
    setIsSettingsVisible(false);

    // Call the external close handler if provided
    if (onClose) {
      logger.info("App: Calling external close handler");
      onClose();
    } else {
      logger.warn("App: External close handler not provided");

      // Fallback implementation - hide the app container
      try {
        const container = document.getElementById("uiscraper-app-container");
        if (container) {
          container.style.display = "none";
          logger.info("App: Hidden app container as fallback close behavior");
        }

        const rootElement = document.getElementById("uiscraper-unified-root");
        if (rootElement) {
          rootElement.style.display = "none";
          logger.info("App: Hidden shadow root container");
        }
      } catch (error) {
        logger.error("App: Failed to hide container elements", error);
      }
    }
  }, [isScrapingActive, onStopScraping, onClose]);

  // Define styles for positioning containers

  // Container for settings popup to ensure it's centered

  return (
    <div id="uiScraper-root" className="uiscraper-app">
      {/* Floating Button */}
      <FloatingButton
        isScrapingActive={isScrapingActive}
        onStartScraping={handleStartScraping}
        onStartContextScraping={handleStartContextScraping}
        onStopScraping={handleStopScraping}
        onToggleSettings={toggleSettingsPopup}
        onStartInspection={handleStartInspection}
        onStopInspection={handleStopInspection}
        isInspectionActive={isInspectionActive}
        onStartAssetExtraction={handleStartAssetExtraction}
        onStartColorPicker={handleStartColorPicker}
        onClose={handleClose}
      />

      {/* Render the ColorPicker component when active */}
      {isColorPickerActive && (
        <ColorPicker
          isActive={isColorPickerActive}
          onClose={handleCloseColorPicker}
        />
      )}

      {/* Render the FontInspectorUI component when active */}
      {isInspectionActive && (
        <FontInspectorUI initialActive={isInspectionActive} />
      )}
    </div>
  );
};

export default App; // Export the component
