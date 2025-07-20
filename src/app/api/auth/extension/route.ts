import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
  console.log("🔍 Handling OPTIONS request for extension auth");
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

// Get extension auth token
export async function GET(request: Request) {
  console.log("🔍 Extension auth token request received");
  try {
    const user = await currentUser();
    console.log("🔍 Current user:", user ? "Found" : "Not found");

    if (!user) {
      console.log("🔍 No authenticated user found");
      return addCorsHeaders(
        NextResponse.json(
          { status: 403, error: "Not authenticated" },
          { status: 403 }
        ),
        request
      );
    }

    // Get the user's subscription status from Clerk using the same method as the web app
    const { has } = await auth();
    const hasProAccess = has({ plan: "pro" });
    const userPlan = hasProAccess ? "pro" : "free";
    const totalPoints = hasProAccess ? 100 : 3;

    console.log("🔍 User plan:", userPlan, "Total points:", totalPoints);

    // Generate a secure token for extension authentication
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        profileImage: user.imageUrl,
        plan: userPlan,
        hasProAccess: hasProAccess,
        totalPoints: totalPoints,
        timestamp: Date.now(),
      })
    ).toString("base64");

    console.log("🔍 Generated extension auth token");
    return addCorsHeaders(
      NextResponse.json({
        status: 200,
        token,
        user: {
          id: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: user.firstName + " " + user.lastName,
          profileImage: user.imageUrl,
          plan: userPlan,
          hasProAccess: hasProAccess,
          totalPoints: totalPoints,
        },
      }),
      request
    );
  } catch (error) {
    console.error("🔍 Error generating extension auth token:", error);
    return addCorsHeaders(
      NextResponse.json(
        { status: 500, error: "Internal Server Error" },
        { status: 500 }
      ),
      request
    );
  }
}

// Verify extension auth token
export async function POST(request: Request) {
  console.log("🔍 Extension auth token verification request received");
  try {
    const { token } = await request.json();
    console.log("🔍 Received token for verification");

    if (!token) {
      console.log("🔍 No token provided");
      return addCorsHeaders(
        NextResponse.json(
          { status: 400, error: "No token provided" },
          { status: 400 }
        ),
        request
      );
    }

    // Decode and verify the token
    const decodedToken = JSON.parse(Buffer.from(token, "base64").toString());
    console.log("🔍 Decoded token:", {
      userId: decodedToken.userId,
      email: decodedToken.email,
      plan: decodedToken.plan,
      hasProAccess: decodedToken.hasProAccess,
      totalPoints: decodedToken.totalPoints,
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

    console.log("🔍 Token verified successfully");
    return addCorsHeaders(
      NextResponse.json({
        status: 200,
        user: {
          id: decodedToken.userId,
          email: decodedToken.email,
          name: decodedToken.name,
          profileImage: decodedToken.profileImage,
          plan: decodedToken.plan,
          hasProAccess: decodedToken.hasProAccess,
          totalPoints: decodedToken.totalPoints,
        },
      }),
      request
    );
  } catch (error) {
    console.error("🔍 Error verifying extension auth token:", error);
    return addCorsHeaders(
      NextResponse.json(
        { status: 500, error: "Internal Server Error" },
        { status: 500 }
      ),
      request
    );
  }
}
