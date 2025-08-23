import { TreeItem } from "@/types/types";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, FileIcon, FolderIcon } from "lucide-react";

interface TreeViewProps {
  data: TreeItem[];
  value: string | null;
  onSelect?: (value: string) => void;
}
export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.map((item, i) => (
                <Tree
                  key={i}
                  item={item as any}
                  selectedValue={value}
                  onSelect={onSelect}
                  parentPath=""
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
};

interface TreeProps {
  item: TreeItem[];
  selectedValue?: string | null;
  onSelect?: (value: string) => void;
  parentPath: string;
}

const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
  const [name, ...items] = Array.isArray(item) ? item : [item];
  const currentPath = parentPath ? `${parentPath}/${name}` : name;
  if (!items.length) {
    const isSelected = selectedValue === currentPath;
    return (
      <SidebarMenuButton
        isActive={isSelected}
        className=" data-[active=true]:bg-transparent"
        onClick={() => onSelect?.(currentPath as any)}
      >
        <FileIcon />
        <span className=" truncate">{name}</span>
      </SidebarMenuButton>
    );
  }
  return (
    <SidebarMenuItem>
      <Collapsible
        className=" group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90 "
        defaultOpen
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className=" cursor-pointer">
            <ChevronRight className=" transition-transform" />
            <FolderIcon />
            <span className=" truncate">{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className=" cursor-pointer">
            {items.map((subItem, i) => (
              <Tree
                key={i}
                item={subItem as any}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath as any}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};
