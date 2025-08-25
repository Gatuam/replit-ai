"use client";

import { useCurrentTheme } from "@/hooks/use-current-theme";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Image from "next/image";
import React from "react";

const Page = () => {
  const currentTheme = useCurrentTheme();
  return (
    <div className=" flex flex-col max-w-3xl mx-auto w-full space-y-6">
      <section className=" space-y-6 pt-[10vh] 2xl:pt-48 p-8 rounded-2xl ">
        <div className=" flex flex-col items-center">
          <Image src={"/logo.png"} alt="replit" width={50} height={50}></Image>
        </div>
        <h1 className=" text-xl md:text-3xl font-black text-center">Pricing</h1>
        <p className=" text-muted-foreground text-center text-sm">
          Choose the plan that fits your need
        </p>
      </section>
      <PricingTable
        appearance={{
          baseTheme: currentTheme === "dark" ? dark : undefined,
          elements: {
            cardBox: "border! shadow-none! rounded-lg!",
          },
        }}
      />
    </div>
  );
};

export default Page;
