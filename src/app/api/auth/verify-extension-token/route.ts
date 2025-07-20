import { NextResponse } from "next/server";
import { verifyExtensionAuthToken } from "@/actions/auth";

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

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return addCorsHeaders(
        NextResponse.json(
          { status: 400, error: "Token is required" },
          { status: 400 }
        ),
        request
      );
    }

    const result = await verifyExtensionAuthToken(token);

    if (result.status === 200) {
      return addCorsHeaders(NextResponse.json(result), request);
    } else {
      return addCorsHeaders(
        NextResponse.json(result, { status: result.status }),
        request
      );
    }
  } catch (error) {
    console.error("Error verifying extension token:", error);
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
