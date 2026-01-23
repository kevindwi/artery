import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";

import { NavUser } from "./nav-user";
import {
  AudioWaveform,
  Bookmark,
  CalendarClock,
  Command,
  GalleryVerticalEnd,
  House,
  LayoutGrid,
  Router,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/app",
      icon: House,
      isActive: true,
    },
    {
      title: "Templates",
      url: "/app/templates",
      icon: Bookmark,
    },
    {
      title: "Devices",
      url: "/app/devices",
      icon: Router,
    },
    {
      title: "Dashboard",
      icon: LayoutGrid,
      items: [
        {
          title: "hello",
          url: "/app/dashboard",
        },
      ],
    },
    {
      title: "Automation",
      url: "/app/automations",
      icon: CalendarClock,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: organizations } = authClient.useListOrganizations();
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image ?? undefined,
  };

  const organizationList = organizations as {
    name: string;
    logo?: string | undefined;
  }[];

  return (
    <Sidebar
      {...props}
      className="h-screen group-data-[side=left]:border-0"
      variant="sidebar"
      collapsible="offcanvas"
    >
      <SidebarHeader>
        <TeamSwitcher teams={organizationList} />
      </SidebarHeader>
      <SidebarContent className="gap-0 mt-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
