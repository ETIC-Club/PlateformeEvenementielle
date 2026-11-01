import { z } from "zod";

import { fileSchema, idSchema } from "@/lib/schemas";

// ---- Fond de badge -------------------------------------------------------

export const BADGE_BACKGROUND_MAX_BYTES = 5 * 1024 * 1024; // 5 Mo
export const BADGE_BACKGROUND_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** Champ multipart `file` de `PUT /api/events/:id/badge-background`. */
export const badgeBackgroundFileSchema = fileSchema({
  maxBytes: BADGE_BACKGROUND_MAX_BYTES,
  mimeTypes: BADGE_BACKGROUND_MIME_TYPES,
});

export const badgeBackgroundSchema = z.object({
  badgeBackgroundUrl: z.url(),
});
export type BadgeBackgroundDto = z.infer<typeof badgeBackgroundSchema>;

// ---- Génération PDF ------------------------------------------------------

export const BADGES_BATCH_MAX = 500;

/** Corps de `POST /api/events/:id/badges`. Sans `participantIds` : tous les participants. */
export const generateBadgesBodySchema = z.object({
  participantIds: z.array(idSchema).min(1).max(BADGES_BATCH_MAX).optional(),
});
export type GenerateBadgesInput = z.infer<typeof generateBadgesBodySchema>;

/** `?download=true` → téléchargement plutôt qu'affichage dans le navigateur. */
export const badgeDownloadQuerySchema = z.object({
  download: z.stringbool().default(false),
});
