import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function onAuthenticateUser() {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403 };
    }

    // Since we don't have a separate User model, we'll return the Clerk user data
    // The system uses Clerk user ID directly in the Project model
    return {
      status: 200,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        profileImage: user.imageUrl,
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

// Add a function to verify extension auth token
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
      },
    };
  } catch (error) {
    console.error("Error verifying extension auth token:", error);
    return { status: 500, error: "Internal Server Error" };
  }
}
