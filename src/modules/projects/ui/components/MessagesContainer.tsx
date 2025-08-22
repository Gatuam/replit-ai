"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { MessageCrad } from "./MessageCrad";
import { MessageForm } from "./MessageForm";
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./MessageLoading";
interface Props {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}
export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getmany.queryOptions({
      projectId: projectId,
    })
  );
  useEffect(() => {
    const lastAssistantMessage = messages.findLast(
      (message) => message.role === "ASSISTANT"
    );
    if (lastAssistantMessage) {
      setActiveFragment(lastAssistantMessage.fragment);
    }
  }, [messages, setActiveFragment]);
  useEffect(() => {
    bottomRef?.current?.scrollIntoView();
  }, [messages.length]);

  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "USER";

  return (
    <div className=" relative flex flex-col max-h-screen ">
      <div className=" flex-1  overflow-y-auto no-scrollbar bg-gradient-to-b from-neutral-50 to-neutral-200 ">
        <div className="pt-2 pr-1 space-y-2  ">
          {messages.map((message, i) => (
            <MessageCrad
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message?.fragment?.id}
              onFragmentClick={() => setActiveFragment(message.fragment)}
              type={message.type}
            />
          ))}
          {isLastMessageUser && <MessageLoading />}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className=" relative p-3 pt-1">
        <div className=" absolute -top-6 left-0 right-0 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
