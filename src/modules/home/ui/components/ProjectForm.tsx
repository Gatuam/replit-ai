"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "@/constant";
import { useClerk } from "@clerk/nextjs";

interface MessageProps {
  projectId: string;
}
const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Prompt is required" })
    .max(10000, { message: "Prompt is too long, must be under 10000 chars" }),
});

export const ProjectForm = () => {
  const clerk = useClerk();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
    mode: "onChange",
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        form.reset({ value: "" });
        queryClient.invalidateQueries(trpc.projects.getmany.queryOptions());
        queryClient.invalidateQueries(trpc.usage.status.queryOptions());
        router.push(`/projects/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
        if (error?.data?.code === "TOO_MANY_REQUESTS") {
          router.push("/pricing");
        }
      },
    })
  );
  const onSelect = (value: string) => {
    form.setValue("value", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
  const [isFocused, setIsFocoued] = useState(false);
  const isPending = createProject.isPending;
  const isDisable = isPending || !form.formState.isValid;
  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: value.value,
    });
  };
  return (
    <div className="space-y-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            " relative border p-4 pt-1 rounded-xl space-y-1 bg-neutral-100 dark:bg-sidebar border-[#b1b1b14a] transition-all",
            isFocused && "shadow-xs"
          )}
        >
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel></FormLabel>
                <FormControl>
                  <TextareaAutosize
                    disabled={isPending}
                    {...field}
                    onFocus={() => setIsFocoued(true)}
                    onBlur={() => setIsFocoued(false)}
                    minRows={3}
                    maxRows={6}
                    className="pt-2 resize-none border-none w-full outline-none bg-transparent"
                    placeholder="What would you like to build?"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)(e);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className=" flex gap-x-2 items-center justify-between pt-2">
            <div className="text-[10px] text-muted-foreground font-sans ">
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ">
                <span>&#8984;</span>
                Enter
              </kbd>
              &nbsp; to Submit
            </div>
            <Button
              type="submit"
              size={"sm"}
              className={cn(
                "size-8 rounded-full cursor-pointer",
                isDisable && "bg-muted-foreground border"
              )}
            >
              {isPending ? <Loader2 className=" animate-spin" /> : <ArrowUp />}
            </Button>
          </div>
        </form>
        {
          <div className=" flex-wrap justify-center gap-2 md:flex max-w-3xl flex">
            {PROJECT_TEMPLATES.map((template, i) => (
              <Button
                key={i}
                variant={"outline"}
                size={"sm"}
                className=" bg-white dark:bg-sidebar cursor-pointer shadow-md "
                onClick={() => onSelect(template.prompt)}
              >
                {template.title}
              </Button>
            ))}
          </div>
        }
      </Form>
    </div>
  );
};
