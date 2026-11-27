import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseQuery } from "@/lib/api/parse";
import { created, paginated } from "@/lib/api/response";
import { createEventSchema, listEventsQuerySchema } from "@/features/events/schemas";
import { createEvent, listEvents } from "@/features/events/service";

/** Liste paginée des événements (recherche `q`, tri `sort` / `order`). Rôles : admin, agent. */
export const GET = defineRoute(["admin", "agent"], async ({ request }) => {
  const query = parseQuery(request, listEventsQuerySchema);
  const { items, meta } = await listEvents(query);
  return paginated(items, meta);
});

/** Crée un événement. Rôles : admin. Erreurs : 400. */
export const POST = defineRoute(["admin"], async ({ request }) => {
  const input = await parseBody(request, createEventSchema);
  return created(await createEvent(input));
});
