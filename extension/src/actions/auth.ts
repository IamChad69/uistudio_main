import config from "../config/environment";

interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  subscription?: {
    plan: {
      name: string;
      extractionLimit: number;
    };
  };
}

interface AuthResponse {
  status: number;
  token?: string;
  user?: User;
  error?: string;
}

// Store the auth token in chrome.storage.local
export const storeAuthToken = async (token: string): Promise<void> => {
  console.log("🔍 Storing auth token...");
  await chrome.storage.local.set({ authToken: token });
  console.log("🔍 Auth token stored successfully");
};

// Get the stored auth token
export const getAuthToken = async (): Promise<string | null> => {
  console.log("🔍 Getting stored auth token...");
  const result = await chrome.storage.local.get("authToken");
  console.log("🔍 Token found:", !!result.authToken);
  return result.authToken || null;
};

// Remove the stored auth token
export const removeAuthToken = async (): Promise<void> => {
  console.log("🔍 Removing auth token...");
  await chrome.storage.local.remove("authToken");
  console.log("🔍 Auth token removed");
};

// Verify the token with the web app
export const verifyToken = async (token: string): Promise<AuthResponse> => {
  console.log("🔍 Verifying token with web app...");
  try {
    const apiUrl = `${config.API_URL}/auth/verify-extension-token`;
    console.log("🔍 Environment config:", {
      NODE_ENV: process.env.NODE_ENV,
      API_URL: config.API_URL,
      IS_DEVELOPMENT: config.IS_DEVELOPMENT,
    });
    console.log("🔍 Making request to:", apiUrl);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "omit" as RequestCredentials,
      mode: "cors",
      body: JSON.stringify({ token }),
    };
    console.log("🔍 Request options:", requestOptions);

    const response = await fetch(apiUrl, requestOptions);
    console.log("🔍 Response status:", response.status);
    console.log(
      "🔍 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      console.error("🔍 API request failed:", {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Token verification response:", {
      status: data.status,
      hasUser: !!data.user,
    });
    return data;
  } catch (error) {
    console.error("🔍 Error verifying token:", error);
    return { status: 500, error: "Failed to verify token" };
  }
};

// Get the current authenticated user
export const getCurrentUser = async (): Promise<AuthResponse> => {
  console.log("🔍 Getting current user...");
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log("🔍 No auth token found");
      return { status: 403, error: "No auth token found" };
    }

    const result = await verifyToken(token);
    console.log("🔍 Current user result:", {
      status: result.status,
      hasUser: !!result.user,
    });
    return result;
  } catch (error) {
    console.error("🔍 Error getting current user:", error);
    return { status: 500, error: "Failed to get current user" };
  }
};

// Check if the user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  console.log("🔍 Checking authentication status...");
  const token = await getAuthToken();
  if (!token) {
    console.log("🔍 No token found, user not authenticated");
    return false;
  }

  const response = await verifyToken(token);
  const isAuth = response.status === 200;
  console.log("🔍 Authentication status:", isAuth);
  return isAuth;
};

// Handle the auth token from the web app
export const handleWebAppAuth = async (
  token: string
): Promise<AuthResponse> => {
  console.log("🔍 Handling web app auth token...");
  try {
    // Verify the token first
    const verificationResponse = await verifyToken(token);
    console.log("🔍 Token verification result:", {
      status: verificationResponse.status,
      hasUser: !!verificationResponse.user,
    });

    if (verificationResponse.status !== 200) {
      return verificationResponse;
    }

    // Store the token if verification was successful
    await storeAuthToken(token);
    console.log("🔍 Web app auth handled successfully");
    return verificationResponse;
  } catch (error) {
    console.error("🔍 Error handling web app auth:", error);
    return { status: 500, error: "Failed to handle web app authentication" };
  }
};
