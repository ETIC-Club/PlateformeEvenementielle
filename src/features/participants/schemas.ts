import { z } from "zod";

import { paginationQuerySchema } from "@/lib/pagination";
import {
  atLeastOneField,
  dateTimeSchema,
  emailSchema,
  idParamsSchema,
  idSchema,
  optionalText,
  searchSchema,
  sortOrderSchema,
} from "@/lib/schemas";

// ---- Entrées -------------------------------------------------------------

/** Pour les routes `/api/participants/:id`. */
export const participantIdParamsSchema = idParamsSchema;

export const createParticipantSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100),
  email: emailSchema,
  phone: optionalText(30),
  organization: optionalText(150),
  jobTitle: optionalText(150),
});
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;

export const updateParticipantSchema = atLeastOneField(createParticipantSchema.partial());
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;

export const listParticipantsQuerySchema = paginationQuerySchema.extend({
  /** Recherche sur prénom, nom, email et organisation. */
  q: searchSchema.optional(),
  organization: z.string().trim().min(1).max(150).optional(),
  sort: z.enum(["lastName", "firstName", "createdAt"]).default("lastName"),
  order: sortOrderSchema.default("asc"),
});
export type ListParticipantsQuery = z.infer<typeof listParticipantsQuerySchema>;

// ---- Sorties -------------------------------------------------------------

export const participantSchema = z.object({
  id: idSchema,
  eventId: idSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  organization: z.string().nullable(),
  jobTitle: z.string().nullable(),
  /** Contenu du QR code (32 caractères). Visible des admins uniquement. */
  qrToken: z.string(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});
export type ParticipantDto = z.infer<typeof participantSchema>;

/** Version réduite, réutilisée par les écrans de scan (sans token ni dates). */
export const participantSummarySchema = participantSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  organization: true,
  jobTitle: true,
});
export type ParticipantSummaryDto = z.infer<typeof participantSummarySchema>;
