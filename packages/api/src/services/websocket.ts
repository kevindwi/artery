/**
 * WebSocket Service for Real-time Telemetry Broadcasting
 *
 * This service manages WebSocket connections and broadcasts telemetry data
 * to connected clients for real-time dashboard updates.
 */

export interface WebSocketMessage {
	type: "telemetry" | "subscription" | "error";
	deviceId?: string;
	datastreamId?: string;
	timestamp?: string;
	value?: any;
	message?: string;
}

export interface TelemetryData {
	deviceId: string;
	datastreamId: string;
	timestamp: string;
	value: any;
}

class WebSocketService {
	private connections: Set<any> = new Set(); // Bun ServerWebSocket
	private deviceSubscriptions: Map<string, Set<any>> = new Map();

	/**
	 * Add a new WebSocket connection
	 */
	addConnection(ws: any) {
		this.connections.add(ws);

		console.log(
			`WebSocket connected. Total connections: ${this.connections.size}`,
		);
	}

	/**
	 * Remove a WebSocket connection
	 */
	removeConnection(ws: any) {
		this.connections.delete(ws);

		// Remove from all device subscriptions
		for (const [deviceId, subscribers] of this.deviceSubscriptions.entries()) {
			subscribers.delete(ws);
			if (subscribers.size === 0) {
				this.deviceSubscriptions.delete(deviceId);
			}
		}

		console.log(
			`WebSocket disconnected. Total connections: ${this.connections.size}`,
		);
	}

	/**
	 * Subscribe a connection to specific device telemetry
	 */
	subscribeToDevice(ws: any, deviceId: string) {
		if (!this.deviceSubscriptions.has(deviceId)) {
			this.deviceSubscriptions.set(deviceId, new Set());
		}
		this.deviceSubscriptions.get(deviceId)!.add(ws);

		// Send confirmation
		this.sendToConnection(ws, {
			type: "subscription",
			message: `Subscribed to device: ${deviceId}`,
		});
	}

	/**
	 * Broadcast telemetry data to all subscribers of a device
	 */
	async broadcastTelemetry(data: TelemetryData) {
		const subscribers = this.deviceSubscriptions.get(data.deviceId);
		if (!subscribers || subscribers.size === 0) {
			return; // No subscribers for this device
		}

		const message: WebSocketMessage = {
			type: "telemetry",
			deviceId: data.deviceId,
			datastreamId: data.datastreamId,
			timestamp: data.timestamp,
			value: data.value,
		};

		const messageStr = JSON.stringify(message);

		// Broadcast to all subscribers of this device
		console.log(
			`Broadcasting to ${subscribers.size} subscribers for device ${data.deviceId}`,
		);
		subscribers.forEach((ws) => {
			try {
				ws.send(messageStr);
				console.log("Message sent to WebSocket subscriber");
			} catch (error) {
				console.error("Error sending WebSocket message:", error);
				this.removeConnection(ws);
			}
		});
	}

	/**
	 * Send message to specific connection
	 */
	private sendToConnection(ws: any, message: WebSocketMessage) {
		if (ws.readyState === 1) {
			// WebSocket.OPEN = 1 in Bun
			try {
				ws.send(JSON.stringify(message));
			} catch (error) {
				console.error("Error sending WebSocket message:", error);
				this.removeConnection(ws);
			}
		}
	}

	/**
	 * Handle incoming WebSocket messages
	 */
	handleMessage(ws: any, message: string) {
		try {
			const data = JSON.parse(message);

			if (data.type === "subscribe" && data.deviceId) {
				this.subscribeToDevice(ws, data.deviceId);
			} else {
				console.warn("Unknown WebSocket message type:", data.type);
			}
		} catch (error) {
			console.error("Error parsing WebSocket message:", error);
			this.sendToConnection(ws, {
				type: "error",
				message: "Invalid message format",
			});
		}
	}

	/**
	 * Get connection statistics
	 */
	getStats() {
		return {
			totalConnections: this.connections.size,
			deviceSubscriptions: Object.fromEntries(
				Array.from(this.deviceSubscriptions.entries()).map(
					([deviceId, subs]) => [deviceId, subs.size],
				),
			),
		};
	}
}

// Singleton instance for the application
export const websocketService = new WebSocketService();
