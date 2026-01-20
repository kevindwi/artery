import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";

// This is sample data.
const data = {
  navMain: [
    {
      items: [
        {
          title: "Features",
          url: "#features",
        },
        {
          title: "Use Cases",
          url: "#use-cases",
        },
        {
          title: "Resources",
          url: "#resources",
        },
        {
          title: "Solutions",
          url: "#solutions",
        },
        {
          title: "Docs",
          url: "/docs",
        },
      ],
    },
  ],
};

export function LandingSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      {...props}
      className="h-screen group-data-[side=left]:border-0"
      variant="sidebar"
      collapsible="offcanvas"
    >
      <SidebarHeader>
        <div className="flex justify-between items-center gap-2">
          <Link to="/home">
            <h1 className="font-medium text-xl p-2">Artery</h1>
          </Link>
          <ModeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Button>
          <a href="#" className="flex items-center gap-2">
            Get Started <ArrowUpRight />
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
