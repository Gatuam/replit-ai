"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (data) => {
        router.push(`/project/${data.id}`)
      },
    })
  );
  return (
    <div className="p-4 max-w-3xl mx-auto flex gap-7 ">
      <Input
        className=" border border-[#111]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        className=" cursor-pointer"
        disabled={createProject.isPending}
        onClick={() => createProject.mutate({ value: value })}
      >
        Invoke background job
      </Button>
    </div>
  );
}
