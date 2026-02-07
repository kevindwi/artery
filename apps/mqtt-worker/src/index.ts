import type { TelemetryPayload } from "@artery/api/services/ingestion";
import { ingestionService } from "@artery/api/services/ingestion";
import { websocketService } from "@artery/api/services/websocket";
import mqtt from "mqtt";

/**
 * MQTT Worker for Artery IoT Platform
 *
 * This worker subscribes to MQTT topics and processes telemetry data
 * from IoT devices using the shared ingestion service.
 *
 * Architecture:
 * - Protocol-specific: Handles MQTT communication
 * - Business logic: Delegated to shared ingestion service
 * - Scalable: Can run multiple instances for load balancing
 * - Fault-tolerant: Automatic reconnection and error handling
 *
 * Future: Ready to integrate with message queue (Redis/RabbitMQ)
 */

class MqttWorker {
  private client: mqtt.MqttClient | null = null;
  private readonly brokerUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor() {
    this.brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
    this.username = process.env.MQTT_USERNAME || "artery_server";
    this.password = process.env.MQTT_PASSWORD || "";

    console.log("MQTT Worker initializing...");
    console.log(`Broker URL: ${this.brokerUrl}`);
  }

  /**
   * Start MQTT worker - connect to broker and subscribe to topics
   */
  async start() {
    console.log("Connecting to MQTT broker...");

    this.client = mqtt.connect(this.brokerUrl, {
      username: this.username,
      password: this.password,
      clientId: `artery_worker_${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      keepalive: 60,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup MQTT event handlers
   */
  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
      this.subscribe();
    });

    this.client.on("message", async (topic, message) => {
      await this.handleMessage(topic, message);
    });

    this.client.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });

    this.client.on("reconnect", () => {
      console.log("Reconnecting to MQTT broker...");
    });

    this.client.on("close", () => {
      console.log("MQTT connection closed");
    });

    this.client.on("offline", () => {
      console.log("MQTT client offline");
    });
  }

  /**
   * Subscribe to MQTT topics
   */
  private subscribe() {
    if (!this.client) return;

    // Subscribe to all device telemetry
    const telemetryTopic = "artery/device/+/telemetry";
    this.client.subscribe(telemetryTopic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${telemetryTopic}:`, err);
      } else {
        console.log(`Subscribed to topic: ${telemetryTopic}`);
      }
    });

    // Subscribe to device status updates
    const statusTopic = "artery/device/+/status";
    this.client.subscribe(statusTopic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${statusTopic}:`, err);
      } else {
        console.log(`Subscribed to topic: ${statusTopic}`);
      }
    });
  }

  /**
   * Handle incoming MQTT messages
   */
  private async handleMessage(topic: string, message: Buffer) {
    try {
      const topicParts = topic.split("/");

      // Validate topic format: artery/device/{deviceId}/{messageType}
      if (
        topicParts.length !== 4 ||
        topicParts[0] !== "artery" ||
        topicParts[1] !== "device"
      ) {
        console.warn(`Invalid topic format: ${topic}`);
        return;
      }

      const deviceId = topicParts[2];
      const messageType = topicParts[3];

      if (messageType === "telemetry") {
        await this.handleTelemetry(deviceId, message);
      } else if (messageType === "status") {
        await this.handleStatus(deviceId, message);
      } else {
        console.warn(`Unknown message type: ${messageType}`);
      }
    } catch (error) {
      console.error("Error handling MQTT message:", error);
    }
  }

  /**
   * Handle telemetry data from device
   */
  private async handleTelemetry(deviceId: string, message: Buffer) {
    try {
      // Parse JSON payload
      const payload: TelemetryPayload = JSON.parse(message.toString());

      console.log(
        `Telemetry received: device=${deviceId}, pin=${payload.pin}, value=${payload.value}`,
      );

      // Use shared ingestion service
      // This is where we could add message queue later:
      // await queue.publish('telemetry', { deviceId, payload });
      const result = await ingestionService.ingest(deviceId, payload);

      console.log(
        `Telemetry processed: device=${deviceId}, pin=${payload.pin}, duration=${result.duration}ms`,
      );

      // Broadcast to WebSocket clients for real-time updates
      try {
        await websocketService.broadcastTelemetry({
          deviceId,
          datastreamId: payload.pin,
          timestamp: new Date().toISOString(),
          value: payload.value,
        });
        console.log(
          `Telemetry broadcasted to WebSocket clients: device=${deviceId}, pin=${payload.pin}`,
        );
      } catch (error) {
        console.error("Error broadcasting to WebSocket clients:", error);
        // Continue without WebSocket - don't fail the telemetry processing
      }
    } catch (error) {
      console.error(`Error processing telemetry for device ${deviceId}:`, error);
      // TODO: Send to dead letter queue for retry
    }
  }

  /**
   * Handle device status updates (online/offline)
   */
  private async handleStatus(deviceId: string, message: Buffer) {
    try {
      const payload = JSON.parse(message.toString());
      const status = payload.status as "ONLINE" | "OFFLINE";

      console.log(`Device status update: ${deviceId} -> ${status}`);

      // TODO: Update device status in database
      // await deviceService.updateStatus(deviceId, status);
    } catch (error) {
      console.error(`Error processing status for device ${deviceId}:`, error);
    }
  }

  /**
   * Publish message to device (for commands/control)
   * This allows bidirectional communication
   */
  async publishToDevice(deviceId: string, pin: string, value: unknown) {
    if (!this.client) {
      throw new Error("MQTT client not connected");
    }

    const topic = `artery/device/${deviceId}/command`;
    const payload = JSON.stringify({ pin, value });

    return new Promise<void>((resolve, reject) => {
      this.client!.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Failed to publish command to ${deviceId}:`, err);
          reject(err);
        } else {
          console.log(`Command sent to ${deviceId}: ${pin}=${value}`);
          resolve();
        }
      });
    });
  }

  /**
   * Stop MQTT worker - disconnect from broker
   */
  async stop() {
    if (this.client) {
      console.log("Stopping MQTT worker...");
      this.client.end();
      this.client = null;
      console.log("MQTT worker stopped");
    }
  }
}

// Initialize and start worker
const worker = new MqttWorker();
await worker.start();

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await worker.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await worker.stop();
  process.exit(0);
});
