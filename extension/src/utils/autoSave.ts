import { logger } from "./logger";

interface AutoSaveOptions {
  scrapedCode: string;
  context?: string;
}

export class AutoSaveManager {
  private static instance: AutoSaveManager;
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {
    // Constructor no longer calls async methods
  }

  public static getInstance(): AutoSaveManager {
    if (!AutoSaveManager.instance) {
      AutoSaveManager.instance = new AutoSaveManager();
    }
    return AutoSaveManager.instance;
  }

  /**
   * Initialize the AutoSaveManager. This method must be called and awaited
   * before any other usage of the manager to guarantee proper setup.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return; // Already initialized
    }

    try {
      const result = await chrome.storage.local.get(["auto_save_results"]);
      this.isEnabled = result.auto_save_results ?? false;
      this.isInitialized = true;
      logger.info(`Auto-save initialized: ${this.isEnabled}`);
    } catch (error) {
      logger.error("Error initializing auto-save:", error);
      throw error; // Re-throw to notify caller of initialization failure
    }
  }

  /**
   * Check if the manager has been properly initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "AutoSaveManager must be initialized before use. Call initialize() first."
      );
    }
  }

  public async setAutoSaveEnabled(enabled: boolean): Promise<void> {
    this.ensureInitialized();

    try {
      await chrome.storage.local.set({ auto_save_results: enabled });
      this.isEnabled = enabled;
      logger.info(`Auto-save ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      logger.error("Error setting auto-save state:", error);
      throw error; // Re-throw to notify caller
    }
  }

  public isAutoSaveEnabled(): boolean {
    this.ensureInitialized();
    return this.isEnabled;
  }

  public async triggerAutoSave(options: AutoSaveOptions): Promise<boolean> {
    this.ensureInitialized();

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
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          value: message,
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
    this.ensureInitialized();

    try {
      await chrome.storage.local.set({ pendingScrapedCode: code });
      logger.info("Pending scraped code stored");
    } catch (error) {
      logger.error("Error storing pending scraped code:", error);
    }
  }

  public async getPendingCode(): Promise<string | null> {
    this.ensureInitialized();

    try {
      const result = await chrome.storage.local.get(["pendingScrapedCode"]);
      return result.pendingScrapedCode || null;
    } catch (error) {
      logger.error("Error getting pending scraped code:", error);
      return null;
    }
  }

  public async clearPendingCode(): Promise<void> {
    this.ensureInitialized();

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
