// Client-side auth utilities that don't import server-only code

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
