"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, WifiIcon, WifiOffIcon } from "lucide-react";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type TelemetryData, useWebSocket } from "@/hooks/use-websocket";
import { trpc } from "@/utils/trpc";

export const description = "IoT Telemetry Chart";

const chartConfig = {
	value: {
		label: "Value",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

const timeRangeOptions = [
	{ value: "1h", label: "Last 1 Hour" },
	{ value: "6h", label: "Last 6 Hours" },
	{ value: "24h", label: "Last 24 Hours" },
	{ value: "7d", label: "Last 7 Days" },
	{ value: "30d", label: "Last 30 Days" },
] as const;

type TimeRange = (typeof timeRangeOptions)[number]["value"];

interface ChartDeviceProps {
	deviceId: string;
	datastreamId: string;
	datastreamName: string;
	dataType?: string;
}

export function ChartDevice({
	deviceId,
	datastreamId,
	datastreamName,
	dataType = "DOUBLE",
}: ChartDeviceProps) {
	const [timeRange, setTimeRange] = React.useState<TimeRange>("1h");
	const [realtimeData, setRealtimeData] = React.useState<Array<TelemetryData>>(
		[],
	);

	const { data, isLoading, error } = useQuery(
		trpc.telemetry.byDevice.queryOptions({
			deviceId,
			datastreamId,
			timeRange,
			limit: 500,
		}),
	);

	const { isConnected, latestData } = useWebSocket();

	// Handle real-time data updates
	React.useEffect(() => {
		const key = `${deviceId}:${datastreamId}`;
		const newTelemetry = latestData.get(key);

		if (newTelemetry) {
			setRealtimeData((prev) => {
				const newData = [...prev, newTelemetry];
				// Keep only last 100 real-time points to prevent memory issues
				return newData.slice(-100);
			});
		}
	}, [latestData, deviceId, datastreamId]);

	// Format data for Recharts - combine historical and real-time data
	const chartData = React.useMemo(() => {
		const historicalData = data
			? [...data].reverse().map((record) => ({
					timestamp: record.timestamp,
					value: record.value,
					isRealtime: false,
					formattedTime: new Date(record.timestamp).toLocaleTimeString(
						"en-US",
						{
							hour: "2-digit",
							minute: "2-digit",
						},
					),
					formattedDate: new Date(record.timestamp).toLocaleDateString(
						"en-US",
						{
							month: "short",
							day: "numeric",
						},
					),
				}))
			: [];

		const realtimeChartData = realtimeData.map((record) => ({
			timestamp: record.timestamp,
			value: record.value,
			isRealtime: true,
			formattedTime: new Date(record.timestamp).toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}),
			formattedDate: new Date(record.timestamp).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
		}));

		// Combine historical and real-time data
		// Filter out real-time data points that are older than our historical data
		const latestHistoricalTime =
			historicalData[historicalData.length - 1]?.timestamp;
		const filteredRealtime = latestHistoricalTime
			? realtimeChartData.filter(
					(point) => point.timestamp > latestHistoricalTime,
				)
			: realtimeChartData;

		return [...historicalData, ...filteredRealtime];
	}, [data, realtimeData]);

	// Determine if this is a boolean/binary chart
	const isBooleanChart = dataType === "BOOL";

	// Format Y-axis based on data type
	const formatYAxis = (value: any) => {
		if (isBooleanChart) {
			return value === 1 || value === true ? "ON" : "OFF";
		}
		if (typeof value === "number") {
			return dataType === "INT" ? String(Math.round(value)) : value.toFixed(2);
		}
		return String(value);
	};

	// Format tooltip value
	const formatTooltipValue = (value: any) => {
		if (isBooleanChart) {
			const isOn = value === 1 || value === true;
			return (
				<div className="flex items-center gap-2">
					<div
						className="h-2 w-2 rounded-full"
						style={{
							backgroundColor: isOn ? "#22c55e" : "#94a3b8",
						}}
					/>
					<span className="font-bold">
						{isOn ? "STATUS: ON" : "STATUS: OFF"}
					</span>
				</div>
			);
		}
		return (
			<span className="font-bold">
				{typeof value === "number"
					? dataType === "INT"
						? Math.round(value)
						: value.toFixed(2)
					: String(value)}
			</span>
		);
	};

	return (
		<Card className="pt-0">
			<CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
				<div className="grid flex-1 gap-1">
					<div className="flex items-center gap-2">
						<CardTitle>{datastreamName}</CardTitle>
						{isConnected ? (
							<WifiIcon className="h-4 w-4 text-green-500" />
						) : (
							<WifiOffIcon className="h-4 w-4 text-gray-400" />
						)}
					</div>
					<CardDescription>
						Real-time telemetry data visualization
						{realtimeData.length > 0 &&
							` (${realtimeData.length} live updates)`}
					</CardDescription>
				</div>
				<Select
					value={timeRange}
					onValueChange={(v) => setTimeRange(v as TimeRange)}
				>
					<SelectTrigger className="w-[160px]">
						<SelectValue placeholder="Select range" />
					</SelectTrigger>
					<SelectContent>
						{timeRangeOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				{isLoading ? (
					<div className="flex h-[250px] items-center justify-center">
						<Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : error ? (
					<div className="flex h-[250px] items-center justify-center">
						<p className="text-destructive text-sm">
							Error loading data: {error.message}
						</p>
					</div>
				) : chartData.length === 0 ? (
					<div className="flex h-[250px] items-center justify-center">
						<p className="text-muted-foreground text-sm">
							No data available for this time range
						</p>
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[250px] w-full"
					>
						<AreaChart data={chartData}>
							<defs>
								<linearGradient
									id={`fill-${datastreamId}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor="var(--color-value)"
										stopOpacity={0.3}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-value)"
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis
								dataKey="formattedTime"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
							/>
							<YAxis
								dataKey="value"
								domain={isBooleanChart ? [0, 1] : ["auto", "auto"]}
								tickCount={isBooleanChart ? 2 : undefined}
								allowDecimals={dataType !== "INT"}
								tickLine={false}
								axisLine={false}
								tickFormatter={formatYAxis}
								width={60}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										hideLabel
										formatter={(value) => formatTooltipValue(value)}
									/>
								}
							/>
							<Area
								dataKey="value"
								type={
									isBooleanChart || dataType === "INT"
										? "stepAfter"
										: "monotone"
								}
								fill={`url(#fill-${datastreamId})`}
								stroke="var(--color-value)"
								strokeWidth={2}
								strokeDasharray="0"
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
