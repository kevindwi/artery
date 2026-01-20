import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/(app)/app")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/signin",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
