import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/pricing(.*)",
]);

// CORS headers for API routes
const getCorsHeaders = (req: NextRequest) => {
  const origin = req.headers.get("origin") || "";

  return {
    // When credentials are involved, we must send back the specific origin
    "Access-Control-Allow-Origin": origin || "*", // Use * only when no origin is provided
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
  };
};

export default clerkMiddleware(async (auth, req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }

  // Check if the route is a public route
  const isPublicApiRoute = isPublicRoute(req);

  // For public API routes, just add CORS headers and continue
  if (isPublicApiRoute) {
    const response = NextResponse.next();
    Object.entries(getCorsHeaders(req)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // For protected routes, add CORS headers and protect
  if (!isPublicRoute(req)) {
    const response = NextResponse.next();
    Object.entries(getCorsHeaders(req)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    await auth.protect();
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
