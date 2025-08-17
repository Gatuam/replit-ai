'use client'
import { useTRPC } from "@/trpc/client";


export default function Home() {
  const trpc = useTRPC();
  trpc.ai.queryOptions({text : "Hello!"})
  return (
   <div>
    hi
   </div>
  );
}
