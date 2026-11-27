import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { noContent, ok } from "@/lib/api/response";
import { eventIdParamsSchema, updateEventSchema } from "@/features/events/schemas";
import { deleteEvent, getEvent, updateEvent } from "@/features/events/service";

type Params = { id: string };

/** Détail d'un événement. Rôles : admin, agent. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin", "agent"], async ({ params }) => {
  const { id } = parseParams(params, eventIdParamsSchema);
  return ok(await getEvent(id));
});

/** Modifie un événement (champs partiels). Rôles : admin. Erreurs : 400, 404. */
export const PATCH = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id } = parseParams(params, eventIdParamsSchema);
  const input = await parseBody(request, updateEventSchema);
  return ok(await updateEvent(id, input));
});

/** Supprime un événement et, en cascade, ses participants, sessions et scans. Rôles : admin. Erreurs : 404. */
export const DELETE = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id } = parseParams(params, eventIdParamsSchema);
  await deleteEvent(id);
  return noContent();
});
