import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LandingSidebar } from "@/components/landing-sidebar";

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <LandingSidebar />
          <SidebarInset className="overflow-x-hidden">
            <div className="flex flex-1 flex-col p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
        <TanStackRouterDevtools position="bottom-right" />
      </ThemeProvider>
    </>
  ),
});
