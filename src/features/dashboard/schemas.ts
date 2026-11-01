import { z } from "zod";

import { SCAN_SESSION_TYPES } from "@/lib/constants";
import { dateTimeSchema, idSchema } from "@/lib/schemas";

/** Taux entre 0 et 1 (0.42 = 42 %). Le front formate en pourcentage. 0 si aucun inscrit. */
const rateSchema = z.number().min(0).max(1);

export const sessionStatsSchema = z.object({
  sessionId: idSchema,
  name: z.string(),
  type: z.enum(SCAN_SESSION_TYPES),
  registered: z.number().int(),
  scanned: z.number().int(),
  rate: rateSchema,
});
export type SessionStatsDto = z.infer<typeof sessionStatsSchema>;

/** Statistiques d'un événement : `GET /api/events/:id/stats`. */
export const eventStatsSchema = z.object({
  eventId: idSchema,
  eventName: z.string(),
  registered: z.number().int(),
  /** Participants scannés dans AU MOINS une session. */
  scanned: z.number().int(),
  rate: rateSchema,
  sessions: z.array(sessionStatsSchema),
});
export type EventStatsDto = z.infer<typeof eventStatsSchema>;

/** Vue d'ensemble : `GET /api/stats/overview`. */
export const overviewStatsSchema = z.object({
  eventsCount: z.number().int(),
  participantsCount: z.number().int(),
  scansCount: z.number().int(),
  events: z.array(
    z.object({
      eventId: idSchema,
      eventName: z.string(),
      startsAt: dateTimeSchema,
      registered: z.number().int(),
      scanned: z.number().int(),
      rate: rateSchema,
    }),
  ),
});
export type OverviewStatsDto = z.infer<typeof overviewStatsSchema>;
