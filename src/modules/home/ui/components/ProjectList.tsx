import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const ProjectList = () => {
  const user = useUser();
  const trpc = useTRPC();
  const { data: projects } = useQuery(trpc.projects.getmany.queryOptions());
  if (!user) return null;

  return (
    <>
      {user && (
        <div className=" w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
          <h2 className=" text-2xl">Previous projects</h2>
          <div className=" grid grid-cols-1 sm:grid-cols-3 gap-6">
            {projects?.length === 0 && (
              <div className=" col-span-full text-center">
                <p className=" text-small text-muted-foreground">
                  No project found
                </p>
              </div>
            )}
            {projects?.map((project, i) => (
              <Button
                key={i}
                variant={"outline"}
                className=" font-normal h-auto justify-start w-full text-start p-4"
                asChild
              >
                <Link href={`/projects/${project.id}`}>
                  <div className=" flex items-center gap-x-4">
                    <Image
                      src="/logo.png"
                      alt="replit"
                      width={50}
                      height={50}
                    ></Image>
                    <div className=" flex flex-col ">
                      <h3 className=" truncate font-medium">{project.name}</h3>
                      <p className=" text-sm text-muted-foreground">
                        {formatDistanceToNow(project.updatedAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
