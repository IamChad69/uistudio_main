/**
 * Browser API utility functions for cross-browser compatibility
 * This module provides safe wrappers around browser extension APIs
 * with fallbacks for content script contexts where APIs may not be available
 */

import browser from "webextension-polyfill";

/**
 * Type definitions for browser API interactions
 */
export type TabQueryInfo = {
  active?: boolean;
  currentWindow?: boolean;
  [key: string]: unknown;
};

export type TabChangeCallback = (
  tabId: number,
  changeInfo?: browser.Tabs.OnUpdatedChangeInfoType,
  tab?: browser.Tabs.Tab
) => void;

export type TabActivatedCallback = (activeInfo: {
  tabId: number;
  windowId: number;
}) => void;

/**
 * Browser API utility for safe API access with better fallbacks
 */
export const browserAPI = {
  tabs: {
    query: async (queryInfo: TabQueryInfo) => {
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
      addListener: (callback: TabChangeCallback) => {
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
      removeListener: (callback: TabChangeCallback) => {
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
    onActivated: {
      addListener: (callback: TabActivatedCallback) => {
        try {
          if (browser?.tabs?.onActivated?.addListener) {
            browser.tabs.onActivated.addListener(callback);
            return true;
          }
          // Quiet warning - this is expected in content scripts
          console.debug(
            "Browser tabs.onActivated API not available - skipping listener"
          );
          return false;
        } catch (error) {
          console.error("Error adding tabs.onActivated listener:", error);
          return false;
        }
      },
      removeListener: (callback: TabActivatedCallback) => {
        try {
          if (browser?.tabs?.onActivated?.removeListener) {
            browser.tabs.onActivated.removeListener(callback);
            return true;
          }
          // No need to log warning during cleanup
          return false;
        } catch (error) {
          console.error("Error removing tabs.onActivated listener:", error);
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
