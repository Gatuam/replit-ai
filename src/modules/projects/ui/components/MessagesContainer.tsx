"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { MessageCrad } from "./MessageCrad";
import { MessageForm } from "./MessageForm";
interface Props {
  projectId: string;
}
export const MessagesContainer = ({ projectId }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const trpc = useTRPC();
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getmany.queryOptions({
      projectId: projectId,
    })
  );
  useEffect(()=>{
    const lastAssistantMessage = messages.findLast(
      (message) => message.role === 'ASSISTANT',
    );
    if(lastAssistantMessage){

    }
  }, [])
  useEffect(()=>{
   bottomRef?.current?.scrollIntoView();
  }, [messages.length])
  return (
    <div className=" flex flex-col h-screen">
      <div className=" flex-1 min-h-0 overflow-y-auto ">
        <div className="pt-2 pr-1 space-y-2  ">
          {messages.map((message, i) => (
            <MessageCrad
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={false}
              onFragmentClick={() => {}}
              type={message.type}
            />
          ))}
        </div>
        <div ref={bottomRef}/>
      </div>
      <div className=" relative p-3 pt-1">
        <div className=" absolute -top-6 left-0 right-0 bg-gradient-to-b from-transparent to-background/70 pointer-events-none"/>
          <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
