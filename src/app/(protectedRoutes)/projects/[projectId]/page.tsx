import { Fragment } from "@/generated/prisma";
import ProjectViews from "@/modules/projects/ui/views/project-views";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ProjectPageProps {
  params: {
    projectId: string;
    data: Fragment;
  };
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { projectId, data } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );
  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<div>Error!</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectViews projectId={projectId} data={data} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </>
  );
};

export default ProjectPage;
