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

interface MessageProps {
  projectId: string;
}
const formSchema = z.object({
  value: z.string()
    .min(1, { message: "Prompt is required" })
    .max(10000, { message: "Prompt is too long, must be under 10000 chars" }),
});


export const MessageForm = ({ projectId }: MessageProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
    mode: "onChange",
  });

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset({ value: ""});
        queryClient.invalidateQueries(
          trpc.messages.getmany.queryOptions({ projectId })
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const [isFocused, setIsFocoued] = useState(false);
  const [showUsage, setShowUsge] = useState(false);
  const isPending = createMessage.isPending;
  const isDisable = isPending || !form.formState.isValid;
  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      value: value.value,
      projectId,
    });
  };
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            " relative border p-4 pt-1 rounded-xl bg-neutral-100 dark:bg-sidebar transition-all",
            isFocused && "shadow-xs",
            showUsage && "rounded-t-none"
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
      </Form>
    </div>
  );
};
