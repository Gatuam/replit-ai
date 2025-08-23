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
import { FragmentWeb } from "../components/FragmentWeb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CodeView } from "@/components/code-view/CodeView";
import { FileExplore } from "@/components/code-view/file";

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tab, setTab] = useState<"preview" | "code">("preview");
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
    <div className=" min-h-screen max-h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col h-screen relative"
        >
          <Suspense fallback={<p>Loading message...</p>}>
            <MessagesContainer
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
              projectId={projectId}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle className="" />

        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            className=" h-full gap-y-0 "
            defaultValue="preview"
            value={tab}
            onValueChange={(val) => setTab(val as "preview" | "code")}
          >
            <div className=" w-full flex items-center p-3 border-b border-[#1112] gap-2">
              <TabsList className=" h-8 p-0 border rounded-md">
                <TabsTrigger
                  value="preview"
                  className=" rounded-md cursor-pointer"
                >
                  <EyeIcon />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className=" rounded-md cursor-pointer"
                >
                  <Code />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className=" ml-auto  flex items-center gap-x-2">
                <Button asChild variant={"default"} size={"sm"}>
                  <Link href={"pricibg"}>
                    <CrownIcon>Upgrate</CrownIcon>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="preview">
              {!!activeFragment && (
                <FragmentWeb data={activeFragment}></FragmentWeb>
              )}
            </TabsContent>
            <TabsContent value="code">
              {!!activeFragment?.files && (
                <FileExplore
                  files={activeFragment.files as { [path: string]: string }}
                ></FileExplore>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
