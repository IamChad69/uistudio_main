/**
 * Environment configuration for the extension
 *
 * This file provides environment-specific configuration values.
 * The APP_URL and API_URL are injected by webpack.DefinePlugin during build:
 * - For development builds:
 *   - APP_URL: http://localhost:3000
 *   - API_URL: http://localhost:3000/api
 * - For production builds:
 *   - APP_URL: https://uiscraper.com
 *   - API_URL: https://api.uiscraper.com/api
 */

interface EnvironmentConfig {
  APP_URL: string;
  API_URL: string;
  IS_DEVELOPMENT: boolean;
  VERSION: string;
  PLANS: {
    FREE: {
      DAILY_EXTRACTION_LIMIT: number;
      FEATURES: {
        COMPONENT_PLAYGROUND: boolean;
        BOOKMARKS: boolean;
        SCRAPE_STUDIO_EDITOR: boolean;
      };
    };
  };
}

// Get environment variables from webpack DefinePlugin
// TypeScript requires type casting since these are injected at build time
const nodeEnv = process.env.NODE_ENV as string;
const appUrl = process.env.APP_URL as string;
const apiUrl = process.env.API_URL as string;
const extensionVersion = "1.0.0"; // Should be injected from package.json

const config: EnvironmentConfig = {
  // Use the injected values with fallbacks
  APP_URL:
    appUrl ||
    (nodeEnv === "development"
      ? "http://localhost:3000"
      : "https://uiscraper.com"),
  API_URL:
    apiUrl ||
    (nodeEnv === "development"
      ? "http://localhost:3000/api"
      : "https://api.uiscraper.com/api"),
  IS_DEVELOPMENT: nodeEnv === "development",
  VERSION: extensionVersion,
  PLANS: {
    FREE: {
      DAILY_EXTRACTION_LIMIT: 5,
      FEATURES: {
        COMPONENT_PLAYGROUND: false,
        BOOKMARKS: false,
        SCRAPE_STUDIO_EDITOR: false,
      },
    },
  },
};

// Log the environment configuration in development mode
if (config.IS_DEVELOPMENT) {
  console.log("Extension Environment:", {
    NODE_ENV: nodeEnv,
    APP_URL: config.APP_URL,
    API_URL: config.API_URL,
    VERSION: config.VERSION,
    PLANS: config.PLANS,
  });
}

export default config;
