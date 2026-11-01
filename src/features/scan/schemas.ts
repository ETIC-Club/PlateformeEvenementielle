import { z } from "zod";

import { participantSummarySchema } from "@/features/participants/schemas";
import { paginationQuerySchema } from "@/lib/pagination";
import {
  dateTimeSchema,
  idSchema,
  searchSchema,
  sortOrderSchema,
  userRefSchema,
} from "@/lib/schemas";

// ---- Valider un scan -----------------------------------------------------

/** Corps de `POST /api/scan-sessions/:id/scans`. `token` = contenu lu dans le QR code. */
export const scanRequestSchema = z.object({
  token: z.string().trim().min(1, "Token requis").max(200),
});
export type ScanRequest = z.infer<typeof scanRequestSchema>;

export const INVALID_SCAN_REASONS = ["unknown_token", "wrong_event", "session_closed"] as const;

/**
 * Résultat d'un scan. Les trois issues sont des réponses 200 normales (pas des erreurs HTTP) :
 * le front affiche vert / orange / rouge selon `status`.
 */
export const scanResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("valid"),
    participant: participantSummarySchema,
    scan: z.object({
      id: idSchema,
      scannedAt: dateTimeSchema,
      scannedBy: userRefSchema.nullable(),
    }),
  }),
  z.object({
    status: z.literal("already_scanned"),
    participant: participantSummarySchema,
    /** Le scan d'ORIGINE (heure et agent du premier passage). */
    scan: z.object({
      id: idSchema,
      scannedAt: dateTimeSchema,
      scannedBy: userRefSchema.nullable(),
    }),
  }),
  z.object({
    status: z.literal("invalid"),
    reason: z.enum(INVALID_SCAN_REASONS),
  }),
]);
export type ScanResultDto = z.infer<typeof scanResultSchema>;

// ---- Historique d'une session -------------------------------------------

export const listScansQuerySchema = paginationQuerySchema.extend({
  /** Recherche sur le nom / prénom / email du participant. */
  q: searchSchema.optional(),
  /** Filtre par agent. */
  scannedBy: idSchema.optional(),
  order: sortOrderSchema.default("desc"),
});
export type ListScansQuery = z.infer<typeof listScansQuerySchema>;

export const scanHistoryItemSchema = z.object({
  id: idSchema,
  scannedAt: dateTimeSchema,
  participant: participantSummarySchema,
  scannedBy: userRefSchema.nullable(),
});
export type ScanHistoryItemDto = z.infer<typeof scanHistoryItemSchema>;

// ---- Scannés / non scannés ----------------------------------------------

export const SCAN_STATUS_FILTERS = ["all", "scanned", "not_scanned"] as const;

export const listSessionParticipantsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(SCAN_STATUS_FILTERS).default("all"),
  q: searchSchema.optional(),
});
export type ListSessionParticipantsQuery = z.infer<typeof listSessionParticipantsQuerySchema>;

export const sessionParticipantSchema = z.object({
  participant: participantSummarySchema,
  scanned: z.boolean(),
  /** `null` si pas encore scanné. */
  scannedAt: dateTimeSchema.nullable(),
  scannedBy: userRefSchema.nullable(),
});
export type SessionParticipantDto = z.infer<typeof sessionParticipantSchema>;
