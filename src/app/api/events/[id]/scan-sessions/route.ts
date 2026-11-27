import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { created, ok } from "@/lib/api/response";
import { eventIdParamsSchema } from "@/features/events/schemas";
import { createScanSessionSchema } from "@/features/scan-sessions/schemas";
import { createScanSession, listScanSessions } from "@/features/scan-sessions/service";

type Params = { id: string }; // id de l'ÉVÉNEMENT

/** Sessions de scan d'un événement avec leur avancement (liste complète, non paginée). Rôles : admin, agent. */
export const GET = defineRoute<Params>(["admin", "agent"], async ({ params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  return ok(await listScanSessions(eventId));
});

/** Crée une session de scan. Rôles : admin. Erreurs : 400, 404, 409 (nom déjà utilisé dans l'événement). */
export const POST = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const input = await parseBody(request, createScanSessionSchema);
  return created(await createScanSession(eventId, input));
});
