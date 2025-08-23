"use client";

import { ProjectForm } from "@/modules/home/ui/components/ProjectForm";
import { ProjectList } from "@/modules/home/ui/components/ProjectList";
import Image from "next/image";

export default function Home() {
  return (
    <div className=" flex flex-col max-w-5xl mx-auto w-full">
      <section className=" space-y-6 py-[16vh] 2xl:py-48">
        <div className=" flex flex-col items-center">
          <Image
            className=" hidden md:block"
            src="/logo.png"
            alt="replit"
            width={80}
            height={50}
          ></Image>
        </div>
        <h1 className=" text-2xl md:text-5xl font-bold text-center">
          Build saas app with <span className=" text-blue-700"> Replit </span>
        </h1>
        <p className=" text-md md:text-md text-muted-foreground text-center">
          Create A Saas app with{" "}
          <span className=" text-white px-2 rounded-sm bg-blue-700 cursor-pointer select-none "> replit.ai.... </span>
        </p>
        <div className=" max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectList/>
    </div>
  );
}
