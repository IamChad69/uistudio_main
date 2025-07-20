import { currentUser } from "@clerk/nextjs/server";

export async function onAuthenticateUser() {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403 };
    }

    // Since we don't have a local User model, we'll just return the Clerk user data
    // The system uses Clerk for authentication and stores user ID in projects
    return {
      status: 200,
      user: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        profileImage: user.imageUrl,
      },
    };
  } catch (error) {
    console.error("ERROR", error);
    return { status: 500, error: "Internal Server Error" };
  }
}

// Add a function to verify extension auth token
export async function verifyExtensionAuthToken(token: string) {
  try {
    const decodedData = JSON.parse(Buffer.from(token, "base64").toString());

    // Since we don't have a local User model, we'll just verify the token structure
    // and return the decoded user data
    if (!decodedData.userId || !decodedData.email) {
      return { status: 403, error: "Invalid token structure" };
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
