import { createTRPCRouter } from "../init";

import { messagesRouter } from "@/modules/messages/server/procedures";
import { projectsRouter } from "@/modules/projects/server/procedures";
import { usageRouter } from "@/modules/usage/server/procedures";
import { bookmarksRouter } from "@/modules/bookmarks/server/procedures";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  usage: usageRouter,
  bookmarks: bookmarksRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
