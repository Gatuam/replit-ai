"use client";
import { Card } from "@/components/ui/card";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRight, Code2 } from "lucide-react";
import Image from "next/image";
import React from "react";

interface UserMessageProps {
  content: string;
}
interface AiMessageProps {
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

interface MessageProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}
interface FragmentProps {
  fragment: Fragment;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentProps) => {
  return (
    <button
      className={cn(
        "flex items-start text-start gap-2 border shadow-md rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors cursor-pointer",
        isActiveFragment &&
          "bg-primary text-primary-foreground border-primary hover:bg-primary"
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2 className="size-4 mt-1" />
      <div className="flex flex-col flex-1">
        <span className="text-sm ">{fragment.title}</span>
        <span className="text-sm">Preview</span>
      </div>
      <div className=" flex items-center justify-center mt-1">
        <ChevronRight className="size-4" />
      </div>
    </button>
  );
};

const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className=" flex justify-end pb-3 pr-3 pl-10">
      <Card className="rounded-md bg-gray-100 shadow-md border border-[#111] p-3 border-none max-w-[80%] break-words  ">
        <p className="text-sm text-neutral-800 ">{content}</p>
      </Card>
    </div>
  );
};
const AiMessage = ({
  content,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: AiMessageProps) => {
  return (
    <div
      className={cn(
        " flex flex-col group px-2 pb-2",
        type === "ERROR" && "text-red-700 dark:text-red-500"
      )}
    >
      <div className=" flex items-center gap-1 pl-2 ">
        <Image
          src="/logo.png"
          width={40}
          height={30}
          alt="logo-replit"
          className=" shrink-0"
        />
        <span className="text-sm font-medium">Replit</span>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 ">
          {format(createdAt, "HH:mm 'on' MM dd, yyyy")}
        </span>
      </div>
      <div className="pl-12 flex flex-col gap-y-4">
        <samp className=" tracking-tight">
          <p className=" text-md">{content}</p>
        </samp>
        {fragment && type === "RESULT" && (
          <FragmentCard
            fragment={fragment}
            isActiveFragment={isActiveFragment}
            onFragmentClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  );
};

export const MessageCrad = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageProps) => {
  if (role === "ASSISTANT") {
    return (
      <>
        <AiMessage
          content={content}
          fragment={fragment}
          createdAt={createdAt}
          isActiveFragment={isActiveFragment}
          onFragmentClick={onFragmentClick}
          type={"RESULT"}
        />
      </>
    );
  }
  return (
    <>
      <UserMessage content={content} />
    </>
  );
};
