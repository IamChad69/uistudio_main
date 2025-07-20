import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";
import { getUsageStatus } from "@/lib/usage";

/**
 * TRPC router for usage-related procedures.
 * Provides a protected endpoint to get the current usage status for the authenticated user.
 */
export const usageRouter = createTRPCRouter({
  status: protectedProcedure.query(async () => {
    try {
      const result = await getUsageStatus();
      return result;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Failed to get usage status:", error);
      // Optionally, you could throw a TRPCError here for better client error handling
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve usage status.",
      });
    }
  }),
});
