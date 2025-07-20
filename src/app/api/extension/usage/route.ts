import { NextResponse } from "next/server";
import { verifyExtensionAuthToken } from "@/actions/auth";
import { getUsageStatusForUser } from "@/lib/usage";

const addCorsHeaders = (response: NextResponse, request: Request) => {
  const origin = request.headers.get("origin") || "";

  // When credentials are used, we must specify the exact origin (cannot use *)
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return addCorsHeaders(
        NextResponse.json(
          { status: 401, error: "Authorization token is required" },
          { status: 401 }
        ),
        request
      );
    }

    // Verify the token and get user info
    const authResult = await verifyExtensionAuthToken(token);

    if (authResult.status !== 200 || !authResult.user) {
      return addCorsHeaders(
        NextResponse.json(
          { status: 401, error: "Invalid or expired token" },
          { status: 401 }
        ),
        request
      );
    }

    // Get usage status using the same function as the web app
    // But we need to use getUsageStatusForUser since we have the user ID and plan
    const usageStatus = await getUsageStatusForUser(
      authResult.user.id,
      authResult.user.plan || "free"
    );

    if (!usageStatus) {
      return addCorsHeaders(
        NextResponse.json(
          { status: 500, error: "Failed to get usage status" },
          { status: 500 }
        ),
        request
      );
    }

    // Get plan limits based on user's subscription
    const planLimits = {
      free: 3, // FREE_POINTS
      pro: 100, // PRO_POINTS
    };

    const plan = authResult.user.plan || "free";
    const totalPoints = planLimits[plan as keyof typeof planLimits] || 3;
    const usedPoints = totalPoints - usageStatus.remainingPoints;

    return addCorsHeaders(
      NextResponse.json({
        status: 200,
        usage: {
          remainingPoints: usageStatus.remainingPoints,
          usedPoints,
          totalPoints,
          msBeforeNext: usageStatus.msBeforeNext,
          plan,
          planName: authResult.user.hasProAccess ? "Pro Plan" : "Free Plan",
          resetTime: new Date(
            Date.now() + usageStatus.msBeforeNext
          ).toISOString(),
        },
      }),
      request
    );
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return addCorsHeaders(
      NextResponse.json(
        { status: 500, error: "Internal server error" },
        { status: 500 }
      ),
      request
    );
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "";

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400", // 24 hours
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
