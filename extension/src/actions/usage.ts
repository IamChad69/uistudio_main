import browser from "webextension-polyfill";
import config from "../config/environment";

/**
 * Opens the web app settings page in a new tab for credit management
 */
export const openCreditManagement = async (): Promise<void> => {
  try {
    const webAppUrl = config.API_URL.replace("/api", "");
    
    // Check if browser.tabs is available (content script context)
    if (typeof browser !== 'undefined' && browser.tabs) {
      await browser.tabs.create({
        url: `${webAppUrl}/settings`,
      });
    } else {
      // Fallback for content script context - open in current tab
      window.open(`${webAppUrl}/settings`, '_blank');
    }
  } catch (error) {
    console.error("Error opening credit management:", error);
    // Fallback to window.open if browser.tabs fails
    const webAppUrl = config.API_URL.replace("/api", "");
    window.open(`${webAppUrl}/settings`, '_blank');
  }
};
