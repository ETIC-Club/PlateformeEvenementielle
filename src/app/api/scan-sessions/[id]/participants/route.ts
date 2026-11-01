import { defineRoute } from "@/lib/api/define-route";
import { parseParams, parseQuery } from "@/lib/api/parse";
import { paginated } from "@/lib/api/response";
import { mockNotFoundIf, mockPage } from "@/lib/mock";
import { MOCK_SESSION_PARTICIPANTS } from "@/features/scan/mocks";
import { listSessionParticipantsQuerySchema } from "@/features/scan/schemas";
import { scanSessionIdParamsSchema } from "@/features/scan-sessions/schemas";

/**
 * Participants de l'événement de la session, avec leur état dans CETTE session.
 * `?status=scanned | not_scanned | all`. Rôles : admin, agent. Erreurs : 404.
 */
export const GET = defineRoute<{ id: string }>(["admin", "agent"], async ({ request, params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);
  const query = parseQuery(request, listSessionParticipantsQuerySchema);

  // TODO(scan): implémenter — LEFT JOIN participants → scans de la session, filtre status et q
  mockNotFoundIf(id, "Session introuvable");
  const filtered = MOCK_SESSION_PARTICIPANTS.filter(
    (row) => query.status === "all" || row.scanned === (query.status === "scanned"),
  );
  const { items, meta } = mockPage(filtered, query);
  return paginated(items, meta);
});
