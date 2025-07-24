import { logger } from "./logger";

interface AutoSaveOptions {
  scrapedCode: string;
  context?: string;
}

export class AutoSaveManager {
  private static instance: AutoSaveManager;
  private isEnabled: boolean = false;

  private constructor() {
    this.initializeAutoSave();
  }

  public static getInstance(): AutoSaveManager {
    if (!AutoSaveManager.instance) {
      AutoSaveManager.instance = new AutoSaveManager();
    }
    return AutoSaveManager.instance;
  }

  private async initializeAutoSave(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(["auto_save_results"]);
      this.isEnabled = result.auto_save_results ?? false;
      logger.info(`Auto-save initialized: ${this.isEnabled}`);
    } catch (error) {
      logger.error("Error initializing auto-save:", error);
    }
  }

  public async setAutoSaveEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    try {
      await chrome.storage.local.set({ auto_save_results: enabled });
      logger.info(`Auto-save ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      logger.error("Error setting auto-save state:", error);
    }
  }

  public async isAutoSaveEnabled(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(["auto_save_results"]);
      return result.auto_save_results ?? false;
    } catch (error) {
      logger.error("Error checking auto-save state:", error);
      return false;
    }
  }

  public async triggerAutoSave(options: AutoSaveOptions): Promise<boolean> {
    if (!this.isEnabled) {
      logger.info("Auto-save is disabled, skipping");
      return false;
    }

    try {
      logger.info("Triggering auto-save...");

      // Get auth token
      const authToken = await this.getAuthToken();
      if (!authToken) {
        logger.error("No auth token available for auto-save");
        return false;
      }

      // Prepare the message with context
      const message = options.context
        ? `${options.context}\n\nScraped Code:\n${options.scrapedCode}`
        : `Auto-saved scraped code:\n\n${options.scrapedCode}`;

      // Call the generate API
      const response = await fetch(`${this.getApiUrl()}/extension/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: message,
          token: authToken,
        }),
      });

      const result = await response.json();

      if (result.status === 200) {
        logger.info("Auto-save successful:", result);
        return true;
      } else {
        logger.error("Auto-save failed:", result);
        return false;
      }
    } catch (error) {
      logger.error("Error during auto-save:", error);
      return false;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.getAppUrl()}/api/auth/extension`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.status === 200 ? data.token : null;
    } catch (error) {
      logger.error("Error getting auth token:", error);
      return null;
    }
  }

  private getApiUrl(): string {
    return process.env.API_URL || "http://localhost:3000/api";
  }

  private getAppUrl(): string {
    return process.env.APP_URL || "http://localhost:3000";
  }

  public async storePendingCode(code: string): Promise<void> {
    try {
      await chrome.storage.local.set({ pendingScrapedCode: code });
      logger.info("Pending scraped code stored");
    } catch (error) {
      logger.error("Error storing pending scraped code:", error);
    }
  }

  public async getPendingCode(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get(["pendingScrapedCode"]);
      return result.pendingScrapedCode || null;
    } catch (error) {
      logger.error("Error getting pending scraped code:", error);
      return null;
    }
  }

  public async clearPendingCode(): Promise<void> {
    try {
      await chrome.storage.local.remove(["pendingScrapedCode"]);
      logger.info("Pending scraped code cleared");
    } catch (error) {
      logger.error("Error clearing pending scraped code:", error);
    }
  }
}

// Export a singleton instance
export const autoSaveManager = AutoSaveManager.getInstance();
