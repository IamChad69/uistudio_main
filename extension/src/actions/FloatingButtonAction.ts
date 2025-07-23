import browser from "webextension-polyfill";
import bookmarkService from "./bookmark";
import { isProUser } from "../utils/status";
import { User } from "../types";

// Browser API utility for safe API access with better fallbacks
const browserAPI = {
  tabs: {
    query: async (queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
      [key: string]: unknown;
    }) => {
      try {
        // First try using the browser.tabs API
        if (browser?.tabs?.query) {
          return await browser.tabs.query(queryInfo);
        }

        // If running in content script, we can't access tabs API
        // Fallback to using window.location for the current page
        console.log(
          "Browser tabs.query API not available, using window.location fallback"
        );

        // Create a mock tab object using the current page's window.location
        if (window?.location?.href) {
          return [
            {
              url: window.location.href,
              title: document.title || "Untitled Page",
              id: -1,
              active: true,
              index: 0,
              highlighted: true,
              pinned: false,
              windowId: -1,
            },
          ];
        }

        console.warn("Unable to get URL from window.location");
        return [];
      } catch (error) {
        console.error("Error accessing tabs.query API:", error);
        // Return minimal mock data in case of error
        if (window?.location?.href) {
          return [
            {
              url: window.location.href,
              title: document.title || "Untitled Page",
            },
          ];
        }
        return [];
      }
    },
    onUpdated: {
      addListener: (
        callback: (
          tabId: number,
          changeInfo?: browser.Tabs.OnUpdatedChangeInfoType,
          tab?: browser.Tabs.Tab
        ) => void
      ) => {
        try {
          if (browser?.tabs?.onUpdated?.addListener) {
            browser.tabs.onUpdated.addListener(callback);
            return true;
          }
          // Quiet warning - this is expected in content scripts
          console.debug(
            "Browser tabs.onUpdated API not available - skipping listener"
          );
          return false;
        } catch (error) {
          console.error("Error adding tabs.onUpdated listener:", error);
          return false;
        }
      },
      removeListener: (
        callback: (
          tabId: number,
          changeInfo?: browser.Tabs.OnUpdatedChangeInfoType,
          tab?: browser.Tabs.Tab
        ) => void
      ) => {
        try {
          if (browser?.tabs?.onUpdated?.removeListener) {
            browser.tabs.onUpdated.removeListener(callback);
            return true;
          }
          // No need to log warning during cleanup
          return false;
        } catch (error) {
          console.error("Error removing tabs.onUpdated listener:", error);
          return false;
        }
      },
    },
  },
  runtime: {
    sendMessage: async (message: unknown) => {
      try {
        if (browser?.runtime?.sendMessage) {
          return await browser.runtime.sendMessage(message);
        }
        console.warn("Browser runtime.sendMessage API not available");
        return null;
      } catch (error) {
        console.error("Error sending runtime message:", error);
        return null;
      }
    },
  },
};

/**
 * Get current page information (URL and title)
 * @returns Promise<{url: string, title: string} | null>
 */
export const getCurrentPageInfo = async (): Promise<{
  url: string;
  title: string;
} | null> => {
  try {
    const tabs = await browserAPI.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length > 0 && tabs[0].url) {
      const url = tabs[0].url;
      const title = tabs[0].title || "Untitled Page";
      return { url, title };
    }
    return null;
  } catch (error) {
    console.error("Error getting current page info:", error);
    return null;
  }
};

/**
 * Check if a URL is bookmarked
 * @param url The URL to check
 * @param user The user object to check pro status
 * @returns Promise<boolean>
 */
export const checkBookmarkStatus = async (
  url: string,
  user?: User | null
): Promise<boolean> => {
  try {
    // If user is not pro, don't show bookmarks as active
    if (!user || !isProUser(user)) {
      return false;
    }
    return await bookmarkService.isBookmarked(url);
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
};

/**
 * Toggle bookmark for a URL
 * @param url The URL to bookmark/unbookmark
 * @param title The title of the page
 * @param isCurrentlyBookmarked Whether the URL is currently bookmarked
 * @param isAuthenticated Whether the user is authenticated
 * @param user The user object to check pro status
 * @returns Promise<{success: boolean, isBookmarked: boolean, error?: string}>
 */
export const toggleBookmark = async (
  url: string,
  title: string,
  isCurrentlyBookmarked: boolean,
  isAuthenticated: boolean,
  user?: User | null
): Promise<{ success: boolean; isBookmarked: boolean; error?: string }> => {
  if (!url) {
    console.warn("No current URL available for bookmarking");
    return { success: false, isBookmarked: isCurrentlyBookmarked };
  }

  // Check if user is pro for bookmark functionality
  if (!isAuthenticated || !user || !isProUser(user)) {
    console.warn("Bookmark feature requires Pro subscription");
    return {
      success: false,
      isBookmarked: isCurrentlyBookmarked,
      error: "Bookmark feature requires Pro subscription",
    };
  }

  try {
    if (isCurrentlyBookmarked) {
      // Remove bookmark
      const success = await bookmarkService.removeBookmark(url);
      if (success) {
        console.log("Bookmark removed successfully");
        return { success: true, isBookmarked: false };
      } else {
        console.error("Failed to remove bookmark");
        return { success: false, isBookmarked: isCurrentlyBookmarked };
      }
    } else {
      // Add bookmark
      const bookmark = await bookmarkService.saveBookmark(url, title);
      console.log("Bookmark added successfully:", bookmark);
      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, isBookmarked: isCurrentlyBookmarked };
  }
};

/**
 * Close the extension
 * @param isScrapingActive Whether scraping is currently active
 * @param onStopScraping Function to stop scraping
 * @param onClose Optional callback when closing
 * @returns Promise<void>
 */
export const closeExtension = async (
  isScrapingActive: boolean,
  onStopScraping: () => void,
  onClose?: () => void
): Promise<void> => {
  console.log("FloatingButton: Close button clicked");

  // Stop scraping if it's active when closing
  if (isScrapingActive) {
    onStopScraping();
  }

  try {
    // Send message to background script to handle extension closing
    await browserAPI.runtime.sendMessage({ action: "closeExtension" });

    // Call the onClose prop if provided
    if (onClose) {
      onClose();
    } else {
      console.warn("FloatingButton: Close handler not provided");

      // Fallback to hiding the component if onClose not provided
      // This uses direct DOM manipulation as a last resort
      const extensionRoot = document.getElementById("uiScraper-root");
      if (extensionRoot) {
        extensionRoot.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error closing extension:", error);
  }
};

/**
 * Handle inspection toggle
 * @param isInspectionActive Whether inspection is currently active
 * @param onStartInspection Function to start inspection
 * @param onStopInspection Function to stop inspection
 */
export const handleInspectionToggle = (
  isInspectionActive: boolean,
  onStartInspection?: () => void,
  onStopInspection?: () => void
): void => {
  console.log("FloatingButton: Inspect button clicked");

  if (isInspectionActive) {
    // Stop inspection if it's active
    if (onStopInspection) {
      console.log("FloatingButton: Stopping UI inspection");
      onStopInspection();
    } else {
      console.warn("FloatingButton: Stop inspection function not provided");
    }
  } else {
    // Start inspection if it's not active
    if (onStartInspection) {
      console.log("FloatingButton: Starting UI inspection");
      onStartInspection();
    } else {
      console.warn("FloatingButton: Start inspection function not provided");
    }
  }
};

/**
 * Handle extraction toggle
 * @param isScrapingActive Whether scraping is currently active
 * @param onStartScraping Function to start scraping
 * @param onStopScraping Function to stop scraping
 */
export const handleExtractionToggle = (
  isScrapingActive: boolean,
  onStartScraping: () => void,
  onStopScraping: () => void
): void => {
  if (isScrapingActive) {
    onStopScraping();
    return;
  }

  // Start scraping (limit checks are now handled by the UI conditionals)
  onStartScraping();
};

/**
 * Handle code context scraping
 * @param onStartContextScraping Function to start context scraping
 */
export const handleCodeContextScraping = (
  onStartContextScraping: () => void
): void => {
  console.log("FloatingButton: Starting code context scraping from AiChat");
  // Use the context scraping method instead of regular scraping
  onStartContextScraping();
};

/**
 * Update chat position based on button position
 * @param starButtonRef Reference to the star button element
 * @param buttonContainerRef Reference to the button container element
 * @returns {x: number, y: number} | null
 */
export const updateChatPosition = (
  starButtonRef: React.RefObject<HTMLButtonElement>,
  buttonContainerRef: React.RefObject<HTMLDivElement>
): { x: number; y: number } | null => {
  if (starButtonRef.current && buttonContainerRef.current) {
    const rect = starButtonRef.current.getBoundingClientRect();
    const mainButtonRect = buttonContainerRef.current
      .querySelector('[role="group"]')
      ?.getBoundingClientRect();

    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    console.log("Button position:", rect);
    return position;
  }
  return null;
};

/**
 * Apply hover effect to an icon button
 * @param element The HTML element to apply hover effect to
 * @param isHovering Whether the element is being hovered
 */
export const applyButtonHoverEffect = (
  element: HTMLElement,
  isHovering: boolean
): void => {
  element.style.color = isHovering ? "rgba(255, 255, 255, 0.9)" : "white";
  element.style.backgroundColor = isHovering
    ? "rgba(255, 255, 255, 0.12)"
    : "transparent";
};

// Export the browserAPI for use in the component
export { browserAPI };
