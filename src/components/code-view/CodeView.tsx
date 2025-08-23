"use client";
import React, { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

interface Props {
  code: string;
  language: string;
}

export const CodeView = ({ code, language }: Props) => {
  useEffect(() => {
    require("prismjs/components/prism-javascript");
    require("prismjs/components/prism-jsx");
    require("prismjs/components/prism-tsx");
    require("prismjs/components/prism-typescript");

    Prism.highlightAll();
  }, [code]);

  return (
    <div className=" flex-1 overflow-y-auto h-full bg-transparent">
      <pre className="border-none rounded-none m-0 text-xs">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};
