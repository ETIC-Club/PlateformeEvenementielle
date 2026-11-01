import { defineRoute } from "@/lib/api/define-route";
import { parseParams } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_EVENT_STATS } from "@/features/dashboard/mocks";
import type { EventStatsDto } from "@/features/dashboard/schemas";
import { eventIdParamsSchema } from "@/features/events/schemas";

/** Statistiques d'un événement : inscrits, scannés, taux, détail par session. Rôles : admin. Erreurs : 404. */
export const GET = defineRoute<{ id: string }>(["admin"], async ({ params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);

  // TODO(dashboard): implémenter — COUNT inscrits, COUNT DISTINCT scannés, par session
  mockNotFoundIf(eventId, "Événement introuvable");
  return ok<EventStatsDto>({ ...MOCK_EVENT_STATS, eventId });
});
