import Image from "next/image";
import React, { useEffect, useState } from "react";

export const ShimmerMessage = () => {
  const [currentMessageIdx, setCurrentMessageIdx] = useState(0);

  const messages = [
    "Thinking...",
    "Loading...",
    "Generating...",
    "Analyzing your request...",
    "Building your website...",
    "Crafting components...",
    "Optimizing layout...",
    "Adding final touches...",
    "Almost ready...",
  ];

  useEffect(() => {
    const intervel = setInterval(() => {
      setCurrentMessageIdx((prv) => (prv + 1) % messages.length);
      return () => clearInterval(intervel);
    }, 2000);
  }, []);

  return (
    <div className=" flex items-center gap-2">
      <span className=" text-base text-muted-foreground  animate-pulse">
        {messages[currentMessageIdx]}
      </span>
    </div>
  );
};

export const MessageLoading = () => {
  return (
    <div className=" flex flex-col group px-2 pb-4">
      <div className="flex items-center gap-2pl-2 mb-2">
        <Image
          src="/logo.png"
          alt="Replit"
          width={30}
          height={30}
          className=" shrink-0"
        ></Image>
        <span className=" text-sm font-medium">Replit</span>
      </div>
      <div className="pl-8 flex flex-col gap-y-4">
        <ShimmerMessage />
      </div>
    </div>
  );
};
