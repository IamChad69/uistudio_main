import config from "../config/environment";
import { logger } from "./logger";
import browser from "webextension-polyfill";

interface ApiResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
}

interface GenerateCodeRequest {
  value: string;
  token: string;
}

interface GenerateCodeResponse {
  projectId: string;
  message: string;
}

/**
 * Retrieves the authentication token from the browser's local storage.
 *
 * @returns The stored auth token if available, or `null` if not found or on error.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const result = await browser.storage.local.get("authToken");
    const token = result.authToken as string | null;
    logger.info("Retrieved auth token:", !!token);
    return token;
  } catch (error) {
    logger.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Sends a request to the code generation API using the provided input value.
 *
 * Attempts to retrieve the authentication token and, if successful, calls the backend API to generate code. Returns a structured response containing the status, generated code data on success, or an error message on failure.
 *
 * @param value - The input string to be used for code generation
 * @returns An API response object with status, generated code data, or an error message
 */
export async function generateCode(
  value: string
): Promise<ApiResponse<GenerateCodeResponse>> {
  try {
    const token = await getAuthToken();

    if (!token) {
      logger.error("No authentication token found");
      return {
        status: 401,
        error: "No authentication token found. Please authenticate first.",
      };
    }

    logger.info("Calling generate code API with token");

    const response = await fetch(`${config.API_URL}/extension/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value,
        token,
      } as GenerateCodeRequest),
    });

    const data = await response.json();
    logger.info("API response:", { status: response.status, data });

    if (!response.ok) {
      logger.error("API request failed:", {
        status: response.status,
        error: data.error,
      });
      return {
        status: response.status,
        error: data.error || "Failed to generate code",
      };
    }

    return {
      status: 200,
      data: data as GenerateCodeResponse,
    };
  } catch (error) {
    logger.error("Error calling generate code API:", error);
    return {
      status: 500,
      error: "Network error occurred while generating code",
    };
  }
}

/**
 * Verifies the provided authentication token with the backend server.
 *
 * Sends a POST request to the verification endpoint and returns the result, including status and any error message.
 *
 * @param token - The authentication token to verify
 * @returns An API response object containing the status, and either the verification result or an error message
 */
export async function verifyAuthToken(token: string): Promise<ApiResponse> {
  try {
    const response = await fetch(
      `${config.API_URL}/auth/verify-extension-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        error: data.error || "Token verification failed",
      };
    }

    return {
      status: 200,
      data,
    };
  } catch (error) {
    logger.error("Error verifying auth token:", error);
    return {
      status: 500,
      error: "Network error occurred while verifying token",
    };
  }
}
