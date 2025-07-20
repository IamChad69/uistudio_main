"use client";

import { useEffect } from "react";
import { getExtensionAuthToken } from "@/lib/auth-client";

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID;

// Check if we're in a browser environment with chrome.runtime
const isChromeExtensionAvailable = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime !== undefined
  );
};

// Safer function to check for chrome runtime errors without TypeScript errors
const getChromeError = () => {
  // @ts-expect-error - Chrome extension API typing issues
  return window.chrome?.runtime?.lastError;
};

const ExtensionAuth = () => {
  useEffect(() => {
    const authenticateExtension = async () => {
      console.log("🔍 Starting extension auth process...");

      if (!EXTENSION_ID) {
        console.error("🔍 Extension ID not found in environment variables");
        return;
      }
      console.log("🔍 Extension ID found:", EXTENSION_ID);

      if (!isChromeExtensionAvailable()) {
        console.log(
          "🔍 Chrome extension API not available - this is normal if the extension is not installed"
        );
        return;
      }

      try {
        console.log("🔍 Getting extension auth token...");
        const { token, status } = await getExtensionAuthToken();

        if (status !== 200 || !token) {
          console.error("🔍 Failed to get extension auth token", { status });
          return;
        }

        console.log("🔍 Sending token to extension...");

        // Use a try-catch for each message sending operation
        try {
          // Send the token to the extension
          window.chrome.runtime.sendMessage(
            EXTENSION_ID,
            {
              type: "AUTH_TOKEN",
              token,
            },
            (tokenResponse) => {
              const error = getChromeError();
              if (error) {
                console.error("🔍 Extension auth error:", error.message);
                return;
              }
              console.log("🔍 Extension auth response:", tokenResponse);
            }
          );
        } catch (error) {
          console.error("🔍 Error sending auth to extension:", error);
        }
      } catch (error) {
        // Handle general errors
        console.error("🔍 Error in authentication process:", error);
      }
    };

    authenticateExtension();
  }, []);

  return null; // This component doesn't render anything
};

export default ExtensionAuth;
