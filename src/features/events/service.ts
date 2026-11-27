// Logique métier de la feature "events" : orchestre les queries, applique les règles,
// lance des AppError. Aucun import de `next/*` : doit rester testable seul.
import type { Event } from "@/db/schema";
import {
  deleteEventById,
  findEventById,
  findEvents,
  insertEvent,
  updateEventById,
} from "@/features/events/queries";
import type {
  CreateEventInput,
  EventDto,
  EventListItemDto,
  ListEventsQuery,
  UpdateEventInput,
} from "@/features/events/schemas";
import { NotFoundError } from "@/lib/errors";
import { buildMeta, type Paginated } from "@/lib/pagination";

const NOT_FOUND_MESSAGE = "Événement introuvable";

function toEventDto(event: Event): EventDto {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    badgeBackgroundUrl: event.badgeBackgroundUrl,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

/** "" devient `null` (champ vidé) ; `undefined` reste `undefined` (champ non modifié). */
function emptyToNull(value: string | null | undefined) {
  return value === undefined ? undefined : value || null;
}

export async function listEvents(query: ListEventsQuery): Promise<Paginated<EventListItemDto>> {
  const { items, total } = await findEvents(query);
  return {
    items: items.map(({ participantsCount, sessionsCount, ...event }) => ({
      ...toEventDto(event),
      participantsCount,
      sessionsCount,
    })),
    meta: buildMeta(query, total),
  };
}

/** Lit un événement ; lance `NotFoundError` s'il n'existe pas. Utilisable par les autres features. */
export async function getEvent(id: string): Promise<EventDto> {
  const event = await findEventById(id);
  if (!event) throw new NotFoundError(NOT_FOUND_MESSAGE);
  return toEventDto(event);
}

export async function createEvent(input: CreateEventInput): Promise<EventDto> {
  const event = await insertEvent({
    name: input.name,
    description: emptyToNull(input.description) ?? null,
    location: emptyToNull(input.location) ?? null,
    startsAt: new Date(input.startsAt),
  });
  return toEventDto(event);
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<EventDto> {
  const event = await updateEventById(id, {
    name: input.name,
    description: emptyToNull(input.description),
    location: emptyToNull(input.location),
    startsAt: input.startsAt === undefined ? undefined : new Date(input.startsAt),
  });
  if (!event) throw new NotFoundError(NOT_FOUND_MESSAGE);
  return toEventDto(event);
}

/** Supprime l'événement ; la base supprime en cascade participants, sessions de scan et scans. */
export async function deleteEvent(id: string): Promise<void> {
  const deleted = await deleteEventById(id);
  if (!deleted) throw new NotFoundError(NOT_FOUND_MESSAGE);
}
