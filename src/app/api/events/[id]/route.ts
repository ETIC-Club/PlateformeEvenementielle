import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { noContent, ok } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_EVENT } from "@/features/events/mocks";
import { eventIdParamsSchema, updateEventSchema, type EventDto } from "@/features/events/schemas";

type Params = { id: string };

/** Détail d'un événement. Rôles : admin, agent. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin", "agent"], async ({ params }) => {
  const { id } = parseParams(params, eventIdParamsSchema);

  // TODO(events): implémenter — lire l'événement (404 si absent)
  mockNotFoundIf(id, "Événement introuvable");
  return ok<EventDto>({ ...MOCK_EVENT, id });
});

/** Modifie un événement (champs partiels). Rôles : admin. Erreurs : 400, 404. */
export const PATCH = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id } = parseParams(params, eventIdParamsSchema);
  const input = await parseBody(request, updateEventSchema);

  // TODO(events): implémenter — mettre à jour (404 si absent)
  mockNotFoundIf(id, "Événement introuvable");
  return ok<EventDto>({ ...MOCK_EVENT, ...input, id });
});

/** Supprime un événement et, en cascade, ses participants, sessions et scans. Rôles : admin. */
export const DELETE = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id } = parseParams(params, eventIdParamsSchema);

  // TODO(events): implémenter — supprimer (404 si absent)
  mockNotFoundIf(id, "Événement introuvable");
  return noContent();
});
