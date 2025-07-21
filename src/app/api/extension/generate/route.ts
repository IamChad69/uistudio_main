import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { verifyExtensionAuthToken } from "@/actions/auth";
import { consumeCreditForUser } from "@/lib/usage";
import { prisma } from "@/lib/db";
import { generateSlug } from "random-word-slugs";
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

/**
 * Handles CORS preflight (OPTIONS) requests by returning a 204 No Content response with appropriate CORS headers.
 */
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

const generateSchema = z.object({
  value: z.string().min(1, { message: "Message is required" }),
  token: z.string().min(1, { message: "Token is required" }),
});

/**
 * Handles POST requests to generate a new code project based on user input.
 *
 * Validates the request body, authenticates the user via token, checks and consumes user credits, creates a new project with the provided input, and triggers asynchronous code generation. Returns a JSON response with the project ID and status, or an error message if authentication, credit, or server errors occur. All responses include appropriate CORS headers.
 *
 * @returns A JSON response containing the project ID and confirmation message on success, or an error message with the appropriate HTTP status code on failure.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { value, token } = generateSchema.parse(body);

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

    // Consume credit using the user ID from the extension token
    try {
      await consumeCreditForUser(authResult.user!.id, authResult.user!.plan);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          { status: 429, error: "You have run out of credits" },
          { status: 429 }
        ),
        request
      );
    }

    // Create a project for the extension user
    const createdProject = await prisma.project.create({
      data: {
        userId: authResult.user?.id,
        name: generateSlug(2, {
          format: "kebab",
        }),
        messages: {
          create: {
            content: value,
            role: "USER",
            type: "RESULT",
          },
        },
      },
    });

    // Trigger the code generation
    await inngest.send({
      name: "code-agent/run",
      data: {
        value: value,
        projectId: createdProject.id,
      },
    });

    return addCorsHeaders(
      NextResponse.json({
        status: 200,
        projectId: createdProject.id,
        message: "Code generation started",
      }),
      request
    );
  } catch (error) {
    console.error("Error in extension generate endpoint:", error);
    return addCorsHeaders(
      NextResponse.json(
        { status: 500, error: "Internal server error" },
        { status: 500 }
      ),
      request
    );
  }
}
