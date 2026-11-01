import { z } from "zod";

import { hexColorSchema } from "@/lib/schemas";

// ---- Entrées -------------------------------------------------------------

/**
 * Options de personnalisation d'un QR code (query string).
 * Les couleurs s'écrivent SANS `#` : `?color=1a2b3c&background=ffffff`.
 */
export const qrOptionsQuerySchema = z.object({
  /** Côté de l'image en pixels (ignoré pour le SVG, qui est vectoriel). */
  size: z.coerce.number().int().min(64).max(1024).default(256),
  color: hexColorSchema.default("000000"),
  background: hexColorSchema.default("ffffff"),
  /** Marge blanche autour du QR, en modules. */
  margin: z.coerce.number().int().min(0).max(8).default(2),
  format: z.enum(["png", "svg"]).default("png"),
  /** `true` → en-tête `Content-Disposition: attachment` (téléchargement) au lieu d'un affichage. */
  download: z.stringbool().default(false),
});
export type QrOptions = z.infer<typeof qrOptionsQuerySchema>;
