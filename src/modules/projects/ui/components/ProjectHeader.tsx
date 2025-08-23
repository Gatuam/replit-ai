"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, EditIcon, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ProjectHeaderProps {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
  const trpc = useTRPC();

  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );
  return (
    <>
      <div className="p-3 flex justify-between items-center border-b ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"ghost"}
              size={"sm"}
              className=" focus-visible:ring-0 hover:bg-transparent hover:opacity-70 transition-opacity pl-2 cursor-pointer"
            >
              <Image
                src="/logo.png"
                alt="Replit"
                width={30}
                height={30}
                className=" shrink-0"
              ></Image>
              
              <span className=" text-sm font-medium">{project?.[0]?.name}</span>
              <ChevronDown></ChevronDown>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            <DropdownMenuItem asChild>
              <Link href={"/"}>
                <ChevronLeft />
                <span>Go to Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SunMoon className=" size-4 text-muted-foreground" />
                <span>Appearance</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value="light"
                    onValueChange={() => {}}
                  >
                    <DropdownMenuRadioItem value="light">
                        <span>Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                        <span>Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                        <span>System</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
