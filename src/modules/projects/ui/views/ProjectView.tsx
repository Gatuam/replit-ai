"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { Suspense, useState } from "react";
import { MessagesContainer } from "../components/MessagesContainer";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/ProjectHeader";

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    })
  );
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getmany.queryOptions({
      projectId: projectId,
    })
  );
  return (
    <div className=" bg-gray-200">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col h-screen relative"
        >
          <div className="">
             <Suspense fallback={<p>Loading project .....</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          </div>
         

          <Suspense fallback={<p>Loading message...</p>}>
            <MessagesContainer
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
              projectId={projectId}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-neutral-300" />
        <ResizablePanel defaultSize={65} minSize={50}>
          todo
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
