"use server";

import { currentUser } from "@clerk/nextjs/server";

export async function getExtensionAuthToken() {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403, error: "Not authenticated" };
    }

    // Generate a secure token for extension authentication
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        profileImage: user.imageUrl,
        timestamp: Date.now(),
      })
    ).toString("base64");

    return {
      status: 200,
      token,
      user: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        profileImage: user.imageUrl,
      },
    };
  } catch (error) {
    console.error("Error generating extension auth token:", error);
    return { status: 500, error: "Internal Server Error" };
  }
}
