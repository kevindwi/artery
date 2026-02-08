import { z } from "zod";
import { organizationProcedure, router } from "../index";
import {
    telemetryQuerySchema,
    telemetryService,
    timeRanges,
} from "../services/telemetry";

export const telemetryRouter = router({
    // Get telemetry data by device with filters
    byDevice: organizationProcedure
        .input(telemetryQuerySchema)
        .query(async ({ ctx, input }) => {
            return await telemetryService.getByDevice(ctx.activeOrgId, input);
        }),

    // Get telemetry data by datastream
    byDatastream: organizationProcedure
        .input(
            z.object({
                datastreamId: z.string(),
                timeRange: z.enum(timeRanges).default("24h"),
                startTime: z.date().optional(),
                endTime: z.date().optional(),
                limit: z.number().min(1).max(1000).default(500),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { datastreamId, ...options } = input;
            return await telemetryService.getByDatastream(
                ctx.activeOrgId,
                datastreamId,
                options,
            );
        }),

    // Get latest telemetry values for all datastreams of a device
    latest: organizationProcedure
        .input(
            z.object({
                deviceId: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await telemetryService.getLatest(ctx.activeOrgId, input.deviceId);
        }),
});
