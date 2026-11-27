// Logique métier de la feature "scan-sessions" : orchestre les queries, applique les règles,
// lance des AppError. Aucun import de `next/*` : doit rester testable seul.
import type { ScanSession } from "@/db/schema";
import { getEvent } from "@/features/events/service";
import {
  deleteScanSessionById,
  findScanSessionById,
  findScanSessionsByEventId,
  insertScanSession,
  isUniqueViolation,
  updateScanSessionById,
} from "@/features/scan-sessions/queries";
import type {
  CreateScanSessionInput,
  ScanSessionDto,
  ScanSessionListItemDto,
  UpdateScanSessionInput,
} from "@/features/scan-sessions/schemas";
import { ConflictError, NotFoundError } from "@/lib/errors";

const NOT_FOUND_MESSAGE = "Session introuvable";
const NAME_TAKEN_MESSAGE = "Une session porte déjà ce nom dans cet événement";

function toScanSessionDto(session: ScanSession): ScanSessionDto {
  return {
    id: session.id,
    eventId: session.eventId,
    name: session.name,
    type: session.type,
    isActive: session.isActive,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

/** Sessions d'un événement avec leur avancement ; `NotFoundError` si l'événement n'existe pas. */
export async function listScanSessions(eventId: string): Promise<ScanSessionListItemDto[]> {
  await getEvent(eventId);
  const sessions = await findScanSessionsByEventId(eventId);
  return sessions.map(({ scannedCount, registeredCount, ...session }) => ({
    ...toScanSessionDto(session),
    scannedCount,
    registeredCount,
  }));
}

/** Lit une session ; lance `NotFoundError` si elle n'existe pas. Utilisable par les autres features. */
export async function getScanSession(id: string): Promise<ScanSessionDto> {
  const session = await findScanSessionById(id);
  if (!session) throw new NotFoundError(NOT_FOUND_MESSAGE);
  return toScanSessionDto(session);
}

export async function createScanSession(
  eventId: string,
  input: CreateScanSessionInput,
): Promise<ScanSessionDto> {
  await getEvent(eventId);
  const session = await insertScanSession({ eventId, name: input.name, type: input.type });
  if (!session) throw new ConflictError(NAME_TAKEN_MESSAGE);
  return toScanSessionDto(session);
}

/** Modifie une session ; `isActive: false` la ferme (plus de scans, historique conservé). */
export async function updateScanSession(
  id: string,
  input: UpdateScanSessionInput,
): Promise<ScanSessionDto> {
  let session: ScanSession | undefined;
  try {
    session = await updateScanSessionById(id, {
      name: input.name,
      type: input.type,
      isActive: input.isActive,
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new ConflictError(NAME_TAKEN_MESSAGE);
    throw error;
  }
  if (!session) throw new NotFoundError(NOT_FOUND_MESSAGE);
  return toScanSessionDto(session);
}

/** Supprime la session ; la base supprime ses scans en cascade. */
export async function deleteScanSession(id: string): Promise<void> {
  const deleted = await deleteScanSessionById(id);
  if (!deleted) throw new NotFoundError(NOT_FOUND_MESSAGE);
}
