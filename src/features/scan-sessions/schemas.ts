import { z } from "zod";

import { SCAN_SESSION_TYPES } from "@/lib/constants";
import { atLeastOneField, dateTimeSchema, idParamsSchema, idSchema } from "@/lib/schemas";

// ---- Entrées -------------------------------------------------------------

/** Pour `/api/scan-sessions/:id`. */
export const scanSessionIdParamsSchema = idParamsSchema;

export const createScanSessionSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  type: z.enum(SCAN_SESSION_TYPES).default("other"),
});
export type CreateScanSessionInput = z.infer<typeof createScanSessionSchema>;

export const updateScanSessionSchema = atLeastOneField(
  createScanSessionSchema.extend({ isActive: z.boolean() }).partial(),
);
export type UpdateScanSessionInput = z.infer<typeof updateScanSessionSchema>;

// ---- Sorties -------------------------------------------------------------

export const scanSessionSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  name: z.string(),
  type: z.enum(SCAN_SESSION_TYPES),
  /** `false` : session fermée, elle refuse les nouveaux scans mais garde son historique. */
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});
export type ScanSessionDto = z.infer<typeof scanSessionSchema>;

/** Session + avancement, pour la liste. */
export const scanSessionListItemSchema = scanSessionSchema.extend({
  /** Participants distincts déjà scannés dans cette session. */
  scannedCount: z.number().int(),
  /** Participants inscrits à l'événement. */
  registeredCount: z.number().int(),
});
export type ScanSessionListItemDto = z.infer<typeof scanSessionListItemSchema>;
