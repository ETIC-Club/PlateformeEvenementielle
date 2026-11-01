import { randomBytes } from "node:crypto";

/**
 * Token de QR code d'un participant : 24 octets aléatoires cryptographiques, soit 32 caractères
 * base64url (192 bits, non devinable). Le QR encode ce token, jamais l'identifiant du participant.
 */
export function generateQrToken(): string {
  return randomBytes(24).toString("base64url");
}
