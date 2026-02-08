import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2Icon, RouterIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { CreateDeviceDialog } from "@/components/create-device-dialog";
import { DevicesTable } from "@/components/devices-table";

export const Route = createFileRoute("/(app)/app/devices/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Devices | Artery",
      },
    ],
  }),
});

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery(trpc.device.all.queryOptions());

  const refreshData = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.device.all.queryKey(),
    });

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2Icon className="h-6 w-6 animate-spin" />
        </div>
      ) : devices?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RouterIcon />
            </EmptyMedia>
            <EmptyTitle>No Devices Yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first device.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateDeviceDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Devices</h1>
              <p className="text-muted-foreground leading-7">
                Manage and organize your reusable device configurations.
              </p>
            </div>

            <div className="mt-2">
              <CreateDeviceDialog />
            </div>
          </div>

          {/* Table */}
          <DevicesTable data={devices ?? []} onActionSuccess={refreshData} />
        </>
      )}
    </>
  );
}
