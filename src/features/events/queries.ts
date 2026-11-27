// Accès base de données de la feature "events" (Drizzle).
// Seul fichier autorisé à importer `@/db/client`. Pas de règle métier ici : uniquement des requêtes.
import { asc, desc, eq, getTableColumns, ilike } from "drizzle-orm";

import { db } from "@/db/client";
import { events, participants, scanSessions, type NewEvent } from "@/db/schema";
import type { ListEventsQuery } from "@/features/events/schemas";
import { toLimitOffset } from "@/lib/pagination";

const SORT_COLUMNS = {
  startsAt: events.startsAt,
  name: events.name,
  createdAt: events.createdAt,
} as const;

/** Échappe `%`, `_` et `\` pour qu'ils soient cherchés tels quels dans un ILIKE. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

/** Page d'événements (recherche sur le nom, tri, pagination) avec leurs compteurs, et le total. */
export async function findEvents(query: ListEventsQuery) {
  const where = query.q ? ilike(events.name, `%${escapeLike(query.q)}%`) : undefined;
  const direction = query.order === "asc" ? asc : desc;
  const { limit, offset } = toLimitOffset(query);

  const [items, total] = await Promise.all([
    db
      .select({
        ...getTableColumns(events),
        participantsCount: db.$count(participants, eq(participants.eventId, events.id)),
        sessionsCount: db.$count(scanSessions, eq(scanSessions.eventId, events.id)),
      })
      .from(events)
      .where(where)
      // `id` en second critère : ordre stable entre les pages quand deux valeurs sont égales.
      .orderBy(direction(SORT_COLUMNS[query.sort]), direction(events.id))
      .limit(limit)
      .offset(offset),
    db.$count(events, where),
  ]);

  return { items, total };
}

export async function findEventById(id: string) {
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return event;
}

export async function insertEvent(values: NewEvent) {
  const [event] = await db.insert(events).values(values).returning();
  return event!;
}

/** Renvoie l'événement modifié, ou `undefined` s'il n'existe pas. */
export async function updateEventById(id: string, values: Partial<NewEvent>) {
  const [event] = await db.update(events).set(values).where(eq(events.id, id)).returning();
  return event;
}

/** Renvoie `true` si une ligne a été supprimée (participants, sessions et scans partent en cascade). */
export async function deleteEventById(id: string) {
  const deleted = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
  return deleted.length > 0;
}
