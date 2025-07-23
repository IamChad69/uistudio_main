import { NextResponse } from "next/server";
import { verifyExtensionAuthToken } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const addCorsHeaders = (response: NextResponse, request: Request) => {
  const origin = request.headers.get("origin") || "";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
};

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}

const bookmarkSchema = z.object({
  url: z.string().url({ message: "Valid URL is required" }),
  title: z.string().optional(),
  action: z.enum(["create", "delete", "deleteByUrl"]).optional(),
  id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, action, id } = bookmarkSchema.parse(body);

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return addCorsHeaders(
        NextResponse.json(
          { status: 401, error: "Missing or invalid authorization header" },
          { status: 401 }
        ),
        request
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the extension auth token
    const authResult = await verifyExtensionAuthToken(token);
    if (authResult.status !== 200) {
      return addCorsHeaders(
        NextResponse.json(
          { status: 401, error: "Invalid or expired token" },
          { status: 401 }
        ),
        request
      );
    }

    const userId = authResult.user!.id;

    // Handle different actions
    if (action === "delete" && id) {
      // Delete bookmark by ID
      const deletedBookmark = await prisma.bookmark.deleteMany({
        where: {
          id,
          userId,
        },
      });

      return addCorsHeaders(
        NextResponse.json({
          status: 200,
          message: "Bookmark deleted successfully",
          deleted: deletedBookmark.count > 0,
        }),
        request
      );
    } else if (action === "deleteByUrl") {
      // Delete bookmark by URL
      const deletedBookmark = await prisma.bookmark.deleteMany({
        where: {
          url,
          userId,
        },
      });

      return addCorsHeaders(
        NextResponse.json({
          status: 200,
          message: "Bookmark deleted successfully",
          deleted: deletedBookmark.count > 0,
        }),
        request
      );
    } else {
      // Create or update bookmark (default action)
      const bookmark = await prisma.bookmark.upsert({
        where: {
          userId_url: {
            userId,
            url,
          },
        },
        update: {
          title: title || null,
          updatedAt: new Date(),
        },
        create: {
          url,
          title: title || null,
          userId,
        },
      });

      return addCorsHeaders(
        NextResponse.json({
          status: 200,
          bookmark: {
            id: bookmark.id,
            url: bookmark.url,
            title: bookmark.title,
            createdAt: bookmark.createdAt,
            updatedAt: bookmark.updatedAt,
          },
        }),
        request
      );
    }
  } catch (error) {
    console.error("Error in extension bookmark endpoint:", error);
    return addCorsHeaders(
      NextResponse.json(
        { status: 500, error: "Internal server error" },
        { status: 500 }
      ),
      request
    );
  }
}
