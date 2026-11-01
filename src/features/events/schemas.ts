import { z } from "zod";

import { paginationQuerySchema } from "@/lib/pagination";
import {
  atLeastOneField,
  dateTimeSchema,
  idParamsSchema,
  idSchema,
  optionalText,
  searchSchema,
  sortOrderSchema,
} from "@/lib/schemas";

// ---- Entrées -------------------------------------------------------------

export const eventIdParamsSchema = idParamsSchema;

export const createEventSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(200),
  description: optionalText(2000),
  location: optionalText(200),
  startsAt: dateTimeSchema,
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = atLeastOneField(createEventSchema.partial());
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const listEventsQuerySchema = paginationQuerySchema.extend({
  q: searchSchema.optional(),
  sort: z.enum(["startsAt", "name", "createdAt"]).default("startsAt"),
  order: sortOrderSchema.default("desc"),
});
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

// ---- Sorties -------------------------------------------------------------

export const eventSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  startsAt: dateTimeSchema,
  /** URL de l'image de fond des badges, `null` si aucune. */
  badgeBackgroundUrl: z.url().nullable(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});
export type EventDto = z.infer<typeof eventSchema>;

/** Élément de liste : l'événement + des compteurs pour l'affichage. */
export const eventListItemSchema = eventSchema.extend({
  participantsCount: z.number().int(),
  sessionsCount: z.number().int(),
});
export type EventListItemDto = z.infer<typeof eventListItemSchema>;
