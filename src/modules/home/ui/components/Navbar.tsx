"use client";
import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/UserControl";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  SignOutButton,
  SignUp,
  SignUpButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className=" p-4 bg-transparent top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent">
      <div className=" max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href={"/"} className=" flex items-center gap-2">
          <Image src={"/logo.png"} width={50} height={50} alt="replit"></Image>
          <span className=" font-semibold text-lg">Replit</span>
        </Link>
        <div className=" flex gap-6">
          <SignedOut>
            <div className=" flex gap-2">
              <SignUpButton>
                <Button variant={"outline"} size={"sm"}>
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedOut>
            <div className=" flex gap-2">
              <SignInButton>
                <Button size={"sm"}>Sign in</Button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserControl showName />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
