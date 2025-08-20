"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { MessagesContainer } from "../components/MessagesContainer";

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
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
    <div className="h-screen bg-gray-200">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
        defaultSize={35}
        minSize={20}
        className="flex flex-col min-h-0"
        >
          <Suspense fallback={<p>Loading message...</p>}>
            <MessagesContainer projectId={projectId} />
          </Suspense>
        
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-neutral-300" />
        <ResizablePanel
        defaultSize={65}
        minSize={50}
        >
         todo
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
