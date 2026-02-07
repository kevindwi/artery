import "dotenv/config";
import { createContext } from "@artery/api/context";
import { appRouter } from "@artery/api/routers/index";
import { websocketService } from "@artery/api/services/websocket";
import { auth } from "@artery/auth";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

// Create separate WebSocket server using Bun
const wsServer = Bun.serve({
	port: 3002,
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname === "/ws") {
			const upgraded = server.upgrade(req);
			if (upgraded) {
				return undefined; // WebSocket connection handled
			}
			return new Response("WebSocket upgrade failed", { status: 400 });
		}
		return new Response("Not found", { status: 404 });
	},
	websocket: {
		open(ws: any) {
			console.log("WebSocket connection opened");
			websocketService.addConnection(ws);
		},
		message(ws: any, message: any) {
			try {
				const messageStr = message.toString();
				websocketService.handleMessage(ws, messageStr);
			} catch (error) {
				console.error("Error decoding WebSocket message:", error);
			}
		},
		close(ws: any, code: any, message: any) {
			console.log(`WebSocket connection closed: ${code} ${message}`);
			websocketService.removeConnection(ws);
		},
	},
});

console.log("WebSocket server running on ws://localhost:3002/ws");

export default app;
