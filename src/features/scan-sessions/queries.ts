// Accès base de données de la feature "scan-sessions" (Drizzle).
// Seul fichier autorisé à importer `@/db/client`. Pas de règle métier ici : uniquement des requêtes.
import { asc, eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db/client";
import { participants, scanSessions, scans, type NewScanSession } from "@/db/schema";

/** Code PostgreSQL d'une violation de contrainte unique. */
const UNIQUE_VIOLATION = "23505";

/** `true` si l'erreur (éventuellement enveloppée par Drizzle dans `cause`) est une violation d'unicité. */
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  while (current instanceof Error) {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) return true;
    current = current.cause;
  }
  return false;
}

/** Sessions d'un événement (ordre de création) avec leurs compteurs scannés / inscrits. */
export async function findScanSessionsByEventId(eventId: string) {
  return db
    .select({
      ...getTableColumns(scanSessions),
      // Un seul scan par (session, participant) : compter les lignes = compter les participants distincts.
      scannedCount: db.$count(scans, eq(scans.sessionId, scanSessions.id)),
      registeredCount: db.$count(participants, eq(participants.eventId, scanSessions.eventId)),
    })
    .from(scanSessions)
    .where(eq(scanSessions.eventId, eventId))
    .orderBy(asc(scanSessions.createdAt), asc(scanSessions.id));
}

export async function findScanSessionById(id: string) {
  const [session] = await db.select().from(scanSessions).where(eq(scanSessions.id, id)).limit(1);
  return session;
}

/** Renvoie la session créée, ou `undefined` si le nom existe déjà dans l'événement. */
export async function insertScanSession(values: NewScanSession) {
  const [session] = await db
    .insert(scanSessions)
    .values(values)
    .onConflictDoNothing({ target: [scanSessions.eventId, scanSessions.name] })
    .returning();
  return session;
}

/**
 * Renvoie la session modifiée, ou `undefined` si elle n'existe pas.
 * Lève une violation d'unicité (voir `isUniqueViolation`) si le nouveau nom existe déjà.
 */
export async function updateScanSessionById(id: string, values: Partial<NewScanSession>) {
  const [session] = await db
    .update(scanSessions)
    .set(values)
    .where(eq(scanSessions.id, id))
    .returning();
  return session;
}

/** Renvoie `true` si une ligne a été supprimée (ses scans partent en cascade). */
export async function deleteScanSessionById(id: string) {
  const deleted = await db
    .delete(scanSessions)
    .where(eq(scanSessions.id, id))
    .returning({ id: scanSessions.id });
  return deleted.length > 0;
}
