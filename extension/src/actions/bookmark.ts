import browser from "webextension-polyfill";
import environment from "../config/environment";
import { getAuthToken } from "./auth";

export interface Bookmark {
  url: string;
  title: string;
  favicon?: string;
  createdAt: number;
  id?: string;
}

// Define the database bookmark type
interface DatabaseBookmark {
  id: string;
  url: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StorageData {
  bookmarks?: Bookmark[];
}

// Define the User type
interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  plan: string;
  hasProAccess: boolean;
}

// API endpoint for bookmark operations
const API_ENDPOINT = `${environment.API_URL}/extension/bookmark`;

/**
 * Service for managing bookmarks in the extension
 */
export const bookmarkService = {
  /**
   * Save a bookmark to storage and sync with database
   * @param url The URL to bookmark
   * @param title The title of the page
   * @returns Promise resolving to the saved bookmark
   */
  async saveBookmark(url: string, title: string): Promise<Bookmark> {
    try {
      // Get favicon if possible
      const favicon = await this.getFavicon(url);

      // Create bookmark object
      const bookmark: Bookmark = {
        url,
        title,
        favicon,
        createdAt: Date.now(),
      };

      // Get existing bookmarks
      const data = (await browser.storage.local.get(
        "bookmarks"
      )) as StorageData;
      const bookmarks: Bookmark[] = Array.isArray(data.bookmarks)
        ? data.bookmarks
        : [];

      // Check if bookmark already exists
      const existingIndex = bookmarks.findIndex((b) => b.url === url);

      if (existingIndex >= 0) {
        // Update existing bookmark
        bookmarks[existingIndex] = bookmark;
      } else {
        // Add new bookmark
        bookmarks.unshift(bookmark);
      }

      // Save updated bookmarks to local storage
      await browser.storage.local.set({ bookmarks });

      // Sync with database
      const dbBookmark = await this.syncBookmarkToDatabase(url, title);
      if (dbBookmark) {
        // Update the bookmark with the database ID
        bookmark.id = dbBookmark.id;
        // Update in storage
        await browser.storage.local.set({ bookmarks });
      }

      return bookmark;
    } catch (error) {
      console.error("Failed to save bookmark:", error);
      throw error;
    }
  },

  /**
   * Sync a bookmark to the database
   * @param url The URL to bookmark
   * @param title The title of the page
   * @returns Promise resolving to the database bookmark
   */
  async syncBookmarkToDatabase(
    url: string,
    title?: string
  ): Promise<DatabaseBookmark | null> {
    try {
      // Get the extension token using the auth system
      const extensionToken = await getAuthToken();

      if (!extensionToken) {
        console.warn("No extension token found, skipping database sync");
        return null;
      }

      // Send to API
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${extensionToken}`,
        },
        body: JSON.stringify({ url, title }),
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        // Check if token is expired
        if (response.status === 401) {
          console.warn("Token expired, attempting to refresh...");
          // Try to refresh the token
          const refreshed = await this.refreshToken(extensionToken);
          if (refreshed) {
            // Retry with the new token
            return this.syncBookmarkToDatabase(url);
          }
        }
        throw new Error(`Failed to sync bookmark: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Bookmark synced to database:", responseData);

      // Return the bookmark data from the response
      return responseData.bookmark;
    } catch (error) {
      console.error("Failed to sync bookmark to database:", error);
      // Don't throw the error to prevent breaking the local bookmark functionality
      return null;
    }
  },

  /**
   * Refresh the extension token
   * @param currentToken The current token
   * @returns Promise resolving to true if successful
   */
  async refreshToken(currentToken: string): Promise<boolean> {
    try {
      // For now, we'll skip token refresh to avoid circular dependencies
      // The token should be refreshed by the auth service when needed
      console.warn("Token refresh not implemented in bookmark service");
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  },

  /**
   * Remove a bookmark from storage and database
   * @param url The URL to remove
   * @returns Promise resolving to true if successful
   */
  async removeBookmark(url: string): Promise<boolean> {
    try {
      // Get existing bookmarks
      const data = (await browser.storage.local.get(
        "bookmarks"
      )) as StorageData;
      const bookmarks: Bookmark[] = Array.isArray(data.bookmarks)
        ? data.bookmarks
        : [];

      // Find the bookmark to remove
      const bookmarkToRemove = bookmarks.find(
        (bookmark) => bookmark.url === url
      );

      // Filter out the bookmark to remove
      const filteredBookmarks = bookmarks.filter(
        (bookmark) => bookmark.url !== url
      );

      // If nothing changed, the bookmark wasn't found
      if (filteredBookmarks.length === bookmarks.length) {
        return false;
      }

      // Save updated bookmarks to local storage
      await browser.storage.local.set({ bookmarks: filteredBookmarks });

      // If we have a database ID, remove from database
      if (bookmarkToRemove?.id) {
        await this.removeBookmarkFromDatabase(bookmarkToRemove.id);
      } else {
        // Try to find and remove by URL if no ID is available
        await this.removeBookmarkFromDatabaseByUrl(url);
      }

      return true;
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      throw error;
    }
  },

  /**
   * Remove a bookmark from the database by ID
   * @param id The bookmark ID
   * @returns Promise resolving to true if successful
   */
  async removeBookmarkFromDatabase(id: string): Promise<boolean> {
    try {
      // Get the extension token using the auth system
      const extensionToken = await getAuthToken();

      if (!extensionToken) {
        console.warn("No extension token found, skipping database removal");
        return false;
      }

      // Use POST with action=delete instead of DELETE to avoid preflight issues
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${extensionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          id,
        }),
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        // Check if token is expired
        if (response.status === 401) {
          console.warn("Token expired, attempting to refresh...");
          // Try to refresh the token
          const refreshed = await this.refreshToken(extensionToken);
          if (refreshed) {
            // Retry with the new token
            return this.removeBookmarkFromDatabase(id);
          }
        }
        throw new Error(
          `Failed to remove bookmark from database: ${response.statusText}`
        );
      }

      console.log("Bookmark removed from database");
      return true;
    } catch (error) {
      console.error("Failed to remove bookmark from database:", error);
      return false;
    }
  },

  /**
   * Remove a bookmark from the database by URL
   * @param url The bookmark URL
   * @returns Promise resolving to true if successful
   */
  async removeBookmarkFromDatabaseByUrl(url: string): Promise<boolean> {
    try {
      // Get the extension token using the auth system
      const extensionToken = await getAuthToken();

      if (!extensionToken) {
        console.warn("No extension token found, skipping database removal");
        return false;
      }

      // Use POST with action=deleteByUrl instead of DELETE to avoid preflight issues
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${extensionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteByUrl",
          url,
        }),
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        // Check if token is expired
        if (response.status === 401) {
          console.warn("Token expired, attempting to refresh...");
          // Try to refresh the token
          const refreshed = await this.refreshToken(extensionToken);
          if (refreshed) {
            // Retry with the new token
            return this.removeBookmarkFromDatabaseByUrl(url);
          }
        }
        throw new Error(
          `Failed to remove bookmark from database: ${response.statusText}`
        );
      }

      console.log("Bookmark removed from database by URL");
      return true;
    } catch (error) {
      console.error("Failed to remove bookmark from database by URL:", error);
      return false;
    }
  },

  /**
   * Check if a URL is bookmarked
   * @param url The URL to check
   * @returns Promise resolving to true if the URL is bookmarked
   */
  async isBookmarked(url: string): Promise<boolean> {
    try {
      const data = (await browser.storage.local.get(
        "bookmarks"
      )) as StorageData;
      const bookmarks: Bookmark[] = Array.isArray(data.bookmarks)
        ? data.bookmarks
        : [];
      return bookmarks.some((bookmark) => bookmark.url === url);
    } catch (error) {
      console.error("Failed to check if URL is bookmarked:", error);
      return false;
    }
  },

  /**
   * Get all bookmarks
   * @returns Promise resolving to an array of bookmarks
   */
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const data = (await browser.storage.local.get(
        "bookmarks"
      )) as StorageData;
      return Array.isArray(data.bookmarks) ? data.bookmarks : [];
    } catch (error) {
      console.error("Failed to get bookmarks:", error);
      return [];
    }
  },

  /**
   * Get favicon URL for a page
   * @param url The URL to get the favicon for
   * @returns Promise resolving to the favicon URL or undefined
   */
  async getFavicon(url: string): Promise<string | undefined> {
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}/favicon.ico`;
    } catch (error) {
      console.error("Failed to get favicon:", error);
      return undefined;
    }
  },
};

export default bookmarkService;
