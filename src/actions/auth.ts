import { currentUser, auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function onAuthenticateUser() {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403 };
    }

    // Get the user's subscription status from Clerk
    const { has } = await auth();
    const hasProAccess = has({ plan: "pro" });

    // Since we don't have a separate User model, we'll return the Clerk user data
    // The system uses Clerk user ID directly in the Project model
    return {
      status: 200,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        profileImage: user.imageUrl,
        plan: hasProAccess ? "pro" : "free",
        hasProAccess,
      },
    };
  } catch (error) {
    console.error("ERROR", error);
    return { status: 500, error: "Internal Server Error" };
  }
}

export const getExtensionAuthToken = async () => {
  console.log("🔍 Getting extension auth token...");
  try {
    const response = await fetch("/api/auth/extension", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("🔍 Extension auth token response:", {
      status: data.status,
      hasToken: !!data.token,
    });
    return data;
  } catch (error) {
    console.error("🔍 Error getting extension auth token:", error);
    return { status: 500, error: "Failed to get extension auth token" };
  }
};

/**
 * Verifies a base64-encoded extension authentication token and returns user information if valid.
 *
 * Decodes the token, checks its structure, and ensures it has not expired (within 24 hours). Returns user details including ID, email, name, profile image, plan, pro access status, and total points if the token is valid. Returns appropriate status codes and error messages for invalid, expired, or malformed tokens.
 *
 * @param token - The base64-encoded authentication token to verify
 * @returns An object containing the status code and either user information or an error message
 */
export async function verifyExtensionAuthToken(token: string) {
  try {
    const decodedData = JSON.parse(Buffer.from(token, "base64").toString());

    // Since we don't have a User model, we'll verify the token by checking if it's valid
    // and contains the expected data structure
    if (!decodedData.userId || !decodedData.email) {
      return { status: 403, error: "Invalid token structure" };
    }

    // Verify the token is not expired (e.g., 24 hours)
    const tokenAge = Date.now() - decodedData.timestamp;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return { status: 401, error: "Token expired" };
    }

    return {
      status: 200,
      user: {
        id: decodedData.userId,
        email: decodedData.email,
        name: decodedData.name,
        profileImage: decodedData.profileImage,
        plan: decodedData.plan || "free",
        hasProAccess: decodedData.hasProAccess || false,
        totalPoints: decodedData.totalPoints || 3,
      },
    };
  } catch (error) {
    console.error("Error verifying extension auth token:", error);
    return { status: 500, error: "Internal Server Error" };
  }
}
