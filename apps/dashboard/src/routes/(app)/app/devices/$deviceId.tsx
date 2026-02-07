import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookTextIcon, ChartLineIcon, Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { ChartDevice } from "@/components/chart-device";
import { DeviceDetailForm } from "@/components/device-detail-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocket } from "@/hooks/use-websocket";
import { trpc } from "@/utils/trpc";

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
	const { subscribeToDevice, unsubscribeFromDevice } = useWebSocket();

	const { data: device, isLoading } = useQuery(
		trpc.device.byId.queryOptions({ deviceId }),
	);

	const { data: datastreams, isLoading: isLoadingDatastreams } = useQuery({
		...trpc.datastream.all.queryOptions({
			templateId: device?.templateId ?? "",
		}),
		enabled: !!device?.templateId,
	});

	// Subscribe to device telemetry when component mounts
	useEffect(() => {
		if (deviceId) {
			subscribeToDevice(deviceId);
		}

		return () => {
			if (deviceId) {
				unsubscribeFromDevice(deviceId);
			}
		};
	}, [deviceId, subscribeToDevice, unsubscribeFromDevice]);

	return (
		<>
			<div>
				<h1 className="font-bold text-2xl">Device details</h1>
				<p className="text-muted-foreground leading-7">
					Configure how your hardware sends and receives data via virtual or
					physical pins.
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
								<div className="m-auto w-full max-w-xl px-1 pt-8">
									<DeviceDetailForm data={device} />
								</div>
							)}
						</TabsContent>
						<TabsContent value="telemetry">
							{isLoadingDatastreams ? (
								<div className="flex justify-center py-8">
									<Loader2Icon className="h-6 w-6 animate-spin" />
								</div>
							) : !datastreams || datastreams.length === 0 ? (
								<div className="flex justify-center py-8">
									<p className="text-muted-foreground text-sm">
										No datastreams configured for this device template
									</p>
								</div>
							) : (
								<div className="grid grid-cols-2 gap-4">
									{datastreams.map((ds) => (
										<ChartDevice
											key={ds.id}
											deviceId={deviceId}
											datastreamId={ds.id}
											datastreamName={ds.name}
											dataType={ds.dataType}
										/>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</>
	);
}
