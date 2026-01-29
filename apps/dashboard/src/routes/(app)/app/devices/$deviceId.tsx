import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookTextIcon, ChartLineIcon, Loader2Icon } from "lucide-react";
import { DeviceDetailForm } from "@/components/device-detail-form";
import { ChartDevice } from "@/components/chart-device";

export const Route = createFileRoute("/(app)/app/devices/$deviceId")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Device Details | Artery",
      },
    ],
  }),
});

function RouteComponent() {
  const { deviceId } = Route.useParams();

  const { data: device, isLoading } = useQuery(
    trpc.device.byId.queryOptions({ deviceId }),
  );

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Device details</h1>
        <p className="text-muted-foreground leading-7">
          Configure how your hardware sends and receives data via virtual or physical
          pins.
        </p>
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="detail">
            <TabsList>
              <TabsTrigger value="detail">
                <BookTextIcon />
                Detail
              </TabsTrigger>
              <TabsTrigger value="telemetry">
                <ChartLineIcon />
                Telemetry
              </TabsTrigger>
            </TabsList>
            <TabsContent value="detail">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2Icon className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="w-full max-w-xl m-auto px-1 pt-8">
                  <DeviceDetailForm data={device} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="telemetry">
              <div className="grid grid-cols-2">
                <ChartDevice />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
