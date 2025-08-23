import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { CodeView } from "./CodeView";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { _toLowerCase } from "zod/v4/core";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "../TreeView";

type FileCollection = { [path: string]: string };

function getlanguageFormExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
}


interface FileBreadProps {
  filePath: string;
}

const FileBreadcumb = ({ filePath }: FileBreadProps) => {
  const pathSegments = filePath.split("/");
  const maxSigment = 4;

  const renderBreadcumbItem = () => {
    if (pathSegments.length <= maxSigment) {
      return pathSegments.map((segment, i) => {
        const isLast = i === pathSegments.length - 1;
        return (
          <Fragment key={i}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className=" font-medium">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className=" text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      const firstSegment = pathSegments[0];
      const lastSegmet = pathSegments[pathSegments.length - 1];
      return (
        <>
          <BreadcrumbItem>
            <span className=" text-muted-foreground">{firstSegment}</span>
            <BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className=" font-medium">
                {lastSegmet}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbItem>
        </>
      );
    }
  };
  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcumbItem()}</BreadcrumbList>
    </Breadcrumb>
  );
};




interface fileExploreProps {
  files: FileCollection;
}

export const FileExplore = ({ files }: fileExploreProps) => {
  const [selectedFIles, setSelectedFiles] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });
  const [copied , setCopied] = useState(false)
  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);
  const handelFiles = useCallback((filePath: string) => {
    if (files[filePath]) {
      setSelectedFiles(filePath);
    }
  }, []);
  const handleCopy = useCallback(()=> {
  if(selectedFIles) {
    navigator.clipboard.writeText(files[selectedFIles]);
    setCopied(true)
    setTimeout(()=> {
      setCopied(false)
    }, 2000)
  }
}, [])
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFIles}
          onSelect={handelFiles}
        ></TreeView>
      </ResizablePanel>
      <ResizableHandle className=" hover:bg-primary transition-colors" />
      <ResizablePanel
        defaultSize={70}
        minSize={50}
        className="bg-sidebar flex flex-col"
      >
        {selectedFIles && files[selectedFIles] ? (
          <div className=" w-full flex flex-col max-h-screen">
            <div className=" border-b  px-4 py-1 flex justify-between items-center gap-x-2">
              <FileBreadcumb
              filePath={selectedFIles}
              />
              <Button
                variant={"outline"}
                size={"icon"}
                className="ml-auto"
                onClick={handleCopy}
                disabled={false}
              >
               { copied ? <CopyCheckIcon/> : <CopyIcon />}
              </Button>
            </div>
            <CodeView
              code={files[selectedFIles]}
              language={getlanguageFormExtension(selectedFIles)}
            ></CodeView>
          </div>
        ) : (
          <div className=" flex h-full justify-center items-center text-muted-foreground">
            Select a file to view content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
