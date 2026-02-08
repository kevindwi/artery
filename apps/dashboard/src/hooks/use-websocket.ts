"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface TelemetryData {
	deviceId: string;
	datastreamId: string;
	timestamp: string;
	value: any;
}

export interface UseWebSocketReturn {
	isConnected: boolean;
	subscribeToDevice: (deviceId: string) => void;
	unsubscribeFromDevice: (deviceId: string) => void;
	latestData: Map<string, TelemetryData>;
	error: string | null;
}

export function useWebSocket(): UseWebSocketReturn {
	const [isConnected, setIsConnected] = useState(false);
	const [latestData, setLatestData] = useState<Map<string, TelemetryData>>(
		new Map(),
	);
	const [error, setError] = useState<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const subscriptionsRef = useRef<Set<string>>(new Set());
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reconnectAttempts = useRef(0);
	const maxReconnectAttempts = 5;

	const connect = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		try {
			const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
			// Use port 3002 for WebSocket server
			const wsUrl = `${protocol}//${window.location.hostname}:3002/ws`;

			console.log("Connecting to WebSocket:", wsUrl);
			wsRef.current = new WebSocket(wsUrl);

			wsRef.current.onopen = () => {
				console.log("WebSocket connected");
				setIsConnected(true);
				setError(null);
				reconnectAttempts.current = 0;

				// Resubscribe to devices after reconnection
				subscriptionsRef.current.forEach((deviceId) => {
					wsRef.current?.send(
						JSON.stringify({
							type: "subscribe",
							deviceId,
						}),
					);
				});
			};

			wsRef.current.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					console.log(message);

					if (
						message.type === "telemetry" &&
						message.deviceId &&
						message.datastreamId
					) {
						const key = `${message.deviceId}:${message.datastreamId}`;
						const telemetryData: TelemetryData = {
							deviceId: message.deviceId,
							datastreamId: message.datastreamId,
							timestamp: message.timestamp,
							value: message.value,
						};

						setLatestData((prev) => {
							const newMap = new Map(prev);
							newMap.set(key, telemetryData);
							return newMap;
						});
					} else if (message.type === "subscription") {
						console.log("Subscription confirmed:", message.message);
					} else if (message.type === "error") {
						console.error("WebSocket error:", message.message);
						setError(message.message);
					}
				} catch (err) {
					console.error("Error parsing WebSocket message:", err);
				}
			};

			wsRef.current.onclose = (event) => {
				console.log("WebSocket disconnected:", event.code, event.reason);
				setIsConnected(false);
				wsRef.current = null;

				// Attempt to reconnect with exponential backoff
				if (reconnectAttempts.current < maxReconnectAttempts) {
					const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
					console.log(
						`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`,
					);

					reconnectTimeoutRef.current = setTimeout(() => {
						reconnectAttempts.current++;
						connect();
					}, delay);
				} else {
					console.error("Max reconnection attempts reached");
					setError("Connection lost. Please refresh the page.");
				}
			};

			wsRef.current.onerror = (event) => {
				console.error("WebSocket error:", event);
				setError("WebSocket connection error");
			};
		} catch (err) {
			console.error("Failed to create WebSocket connection:", err);
			setError("Failed to establish WebSocket connection");
		}
	}, []);

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setIsConnected(false);
		subscriptionsRef.current.clear();
	}, []);

	const subscribeToDevice = useCallback((deviceId: string) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			console.warn("Cannot subscribe: WebSocket not connected");
			return;
		}

		subscriptionsRef.current.add(deviceId);

		try {
			wsRef.current.send(
				JSON.stringify({
					type: "subscribe",
					deviceId,
				}),
			);
		} catch (err) {
			console.error("Error sending subscription:", err);
			setError("Failed to subscribe to device");
		}
	}, []);

	const unsubscribeFromDevice = useCallback((deviceId: string) => {
		subscriptionsRef.current.delete(deviceId);

		// Remove cached data for this device
		setLatestData((prev) => {
			const newMap = new Map(prev);
			for (const [key] of newMap) {
				if (key.startsWith(`${deviceId}:`)) {
					newMap.delete(key);
				}
			}
			return newMap;
		});
	}, []);

	// Initialize connection on mount
	useEffect(() => {
		connect();

		return () => {
			disconnect();
		};
	}, [connect, disconnect]);

	return {
		isConnected,
		subscribeToDevice,
		unsubscribeFromDevice,
		latestData,
		error,
	};
}
