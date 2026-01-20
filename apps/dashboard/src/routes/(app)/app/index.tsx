import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusTable } from "@/components/dashboard/status-table";
import { ChartJsArea } from "@/components/chart-js-area";
import { PieChart } from "lucide-react";

export const Route = createFileRoute("/(app)/app/")({
  component: RouteComponent,
  // beforeLoad: async () => {
  //   const session = await authClient.getSession();
  //   if (!session.data) {
  //     redirect({
  //       to: "/login",
  //       throw: true,
  //     });
  //   }
  //   return { session };
  // },
});

const PROJECT_DATA = Array(6).fill({
  name: "Mobile App Development",
  status: "At Risk",
  color: "bg-green-500",
});

function RouteComponent() {
  // const { session } = Route.useRouteContext();

  const privateData = useQuery(trpc.privateData.queryOptions());

  return (
    <>
      {/* <h1>Dashboard</h1> */}
      {/* <p>Welcome {session.data?.user.name}</p> */}
      {/* <p>API: {privateData.data?.message}</p> */}

      {/* Section: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCard
            key={i}
            label="Total visits"
            value="9,120"
            trend="+20%"
            icon={PieChart}
          />
        ))}
      </div>

      {/* Section: Main Chart */}
      <ChartAreaInteractive />

      {/*<ChartJsArea />*/}

      {/* Section: Status Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusTable
          title="Project Status"
          description="Showing risk levels for current projects"
          items={PROJECT_DATA}
        />
        <StatusTable
          title="Recent Activity"
          description="Summary of the last 3 months"
          items={PROJECT_DATA}
        />
      </div>

      {/* Section: Data Table */}
      <Card className="gap-0 pb-0">
        <CardHeader className="flex items-center gap-2 space-y-0 [.border-b]:pb-4 border-b sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Detailed Analytics</CardTitle>
            <CardDescription>Comprehensive view of all visitor data</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable />
        </CardContent>
      </Card>
    </>
  );
}
