import { Button } from "@/components/ui/button";
import { Fragment } from "@/generated/prisma";
import { ExternalLinkIcon, RefreshCcw } from "lucide-react";
import React, { useState } from "react";

interface FragmentWebProps {
  data: Fragment;
}

export const FragmentWeb = ({ data }: FragmentWebProps) => {
    const [fragmentKey , setFragmentKey] = useState(0)
    const [copy , setCopy] = useState(false)
    const onRefresh = ()=> {
        setFragmentKey((pre)=> pre +1)
    };
    const handleCopy = ()=> {
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopy(true)
        setTimeout(()=> setCopy(false), 2000)
    }
  return (
    <div className=" flex flex-col w-full h-full">
      <div className="p-2 border-b w-full flex justify-start items-center  gap-3">
        <Button 
        className=" cursor-pointer"
        size={"sm"} variant={"outline"} onClick={onRefresh}>
          <RefreshCcw />
        </Button>
        <Button
        disabled={!data.sandboxUrl || copy}
        className=" flex-1 justify-start text-start font-normal cursor-pointer"
        size={"sm"} variant={"outline"} onClick={handleCopy}>
          {data.sandboxUrl}
        </Button>
        <Button 
        disabled={!data.sandboxUrl}
        className=" cursor-pointer"
        size={"sm"} variant={"outline"}
         onClick={() => {
            if(!data.sandboxUrl) return;
            window.open(data.sandboxUrl, '_blank')
         }}>
          <ExternalLinkIcon />
        </Button>
      </div>
      <iframe
      key={fragmentKey}
        className=" h-full w-full "
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data?.sandboxUrl}
      ></iframe>
    </div>
  );
};
