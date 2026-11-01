import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { created, ok } from "@/lib/api/response";
import { MOCK_DATE, mockId, mockNotFoundIf } from "@/lib/mock";
import { eventIdParamsSchema } from "@/features/events/schemas";
import { MOCK_SCAN_SESSION_LIST } from "@/features/scan-sessions/mocks";
import { createScanSessionSchema, type ScanSessionDto } from "@/features/scan-sessions/schemas";

type Params = { id: string }; // id de l'ÉVÉNEMENT

/** Sessions de scan d'un événement avec leur avancement (liste complète, non paginée). Rôles : admin, agent. */
export const GET = defineRoute<Params>(["admin", "agent"], async ({ params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);

  // TODO(scan-sessions): implémenter — lister les sessions + compteurs scannés / inscrits
  mockNotFoundIf(eventId, "Événement introuvable");
  return ok(MOCK_SCAN_SESSION_LIST.map((session) => ({ ...session, eventId })));
});

/** Crée une session de scan. Rôles : admin. Erreurs : 400, 404, 409 (nom déjà utilisé dans l'événement). */
export const POST = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const input = await parseBody(request, createScanSessionSchema);

  // TODO(scan-sessions): implémenter — insérer ; 409 si (eventId, name) existe déjà
  mockNotFoundIf(eventId, "Événement introuvable");
  const session: ScanSessionDto = {
    ...input,
    id: mockId(997),
    eventId,
    isActive: true,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  };
  return created(session);
});
