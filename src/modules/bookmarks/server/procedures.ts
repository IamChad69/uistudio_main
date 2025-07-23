import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const bookmarksRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return bookmarks;
  }),

  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url({ message: "Valid URL is required" }),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const bookmark = await prisma.bookmark.upsert({
        where: {
          userId_url: {
            userId: ctx.auth.userId,
            url: input.url,
          },
        },
        update: {
          title: input.title || null,
          updatedAt: new Date(),
        },
        create: {
          url: input.url,
          title: input.title || null,
          userId: ctx.auth.userId,
        },
      });

      return bookmark;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Bookmark ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the bookmark exists and belongs to the user
      const existingBookmark = await prisma.bookmark.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingBookmark) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bookmark not found",
        });
      }

      // Delete the bookmark
      await prisma.bookmark.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  deleteByUrl: protectedProcedure
    .input(
      z.object({ url: z.string().url({ message: "Valid URL is required" }) })
    )
    .mutation(async ({ input, ctx }) => {
      // Delete the bookmark by URL
      const deletedBookmark = await prisma.bookmark.deleteMany({
        where: {
          url: input.url,
          userId: ctx.auth.userId,
        },
      });

      if (deletedBookmark.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bookmark not found",
        });
      }

      return { success: true };
    }),
});
