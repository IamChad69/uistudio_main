import { NextResponse } from "next/server";
import { getUsageStatusForUser } from "@/lib/usage";

// Helper function to add CORS headers to responses
const addCorsHeaders = (response: NextResponse, request?: Request) => {
  // Get the origin from the request
  const requestOrigin = request?.headers.get("origin") || "";

  // When credentials are used, we must specify the exact origin (cannot use *)
  // So we'll mirror back whatever origin made the request
  response.headers.set("Access-Control-Allow-Origin", requestOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  return response;
};

// Handle preflight requests
export async function OPTIONS(request: Request) {
  console.log("🔍 Handling OPTIONS request for extension usage");
  const origin = request.headers.get("origin") || "";

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Get extension usage data
export async function GET(request: Request) {
  console.log("🔍 Extension usage request received");
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("🔍 No valid authorization header found");
      return addCorsHeaders(
        NextResponse.json(
          { status: 401, error: "No valid authorization header" },
          { status: 401 }
        ),
        request
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("🔍 Token received for verification");

    // Decode and verify the token
    let decodedToken;
    try {
      decodedToken = JSON.parse(Buffer.from(token, "base64").toString());
      console.log("🔍 Decoded token:", {
        userId: decodedToken.userId,
        email: decodedToken.email,
        timestamp: decodedToken.timestamp,
      });

      // Verify the token is not expired (e.g., 24 hours)
      const tokenAge = Date.now() - decodedToken.timestamp;
      if (tokenAge > 24 * 60 * 60 * 1000) {
        console.log("🔍 Token expired");
        return addCorsHeaders(
          NextResponse.json(
            { status: 401, error: "Token expired" },
            { status: 401 }
          ),
          request
        );
      }

      console.log(
        "🔍 Token verified successfully for user:",
        decodedToken.userId
      );
    } catch (error) {
      console.log("🔍 Token verification failed:", error);
      return addCorsHeaders(
        NextResponse.json(
          { status: 401, error: "Invalid token" },
          { status: 401 }
        ),
        request
      );
    }

    // Get usage status using the user ID from the decoded token
    const usageStatus = await getUsageStatusForUser(decodedToken.userId);
    console.log("🔍 Usage status retrieved:", usageStatus);

    if (!usageStatus) {
      console.log("🔍 No usage status available");
      return addCorsHeaders(
        NextResponse.json(
          { status: 500, error: "Unable to retrieve usage status" },
          { status: 500 }
        ),
        request
      );
    }

    // Calculate total points based on remaining and consumed
    const totalPoints =
      usageStatus.remainingPoints + usageStatus.consumedPoints;

    return addCorsHeaders(
      NextResponse.json({
        status: 200,
        usage: {
          remainingPoints: usageStatus.remainingPoints,
          msBeforeNext: usageStatus.msBeforeNext,
          totalPoints: totalPoints,
          consumedPoints: usageStatus.consumedPoints,
        },
      }),
      request
    );
  } catch (error) {
    console.error("🔍 Error getting extension usage:", error);
    return addCorsHeaders(
      NextResponse.json(
        { status: 500, error: "Internal Server Error" },
        { status: 500 }
      ),
      request
    );
  }
}
