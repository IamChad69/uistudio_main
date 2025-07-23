import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredit } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({ id: z.string().min(1, { message: "Project ID is required" }) })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: { id: input.id, userId: ctx.auth.userId },
      });
      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return existingProject;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });
    return projects; 
  }),

  create: protectedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is required" }),
        // .max(1000, { message: "Message is too long" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await consumeCredit();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        }
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have run out of credits",
        });
      }
      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });
      return createdProject;
    }),

  updateName: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Project ID is required" }),
        name: z.string().min(1, { message: "Project name is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the project exists and belongs to the user
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Update the project name
      const updatedProject = await prisma.project.update({
        where: { id: input.id },
        data: {
          name: input.name,
          updatedAt: new Date(),
        },
      });

      return updatedProject;
    }),

  delete: protectedProcedure
    .input(
      z.object({ id: z.string().min(1, { message: "Project ID is required" }) })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the project exists and belongs to the user
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Delete the project and all related data (messages, fragments, etc.)
      await prisma.project.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
