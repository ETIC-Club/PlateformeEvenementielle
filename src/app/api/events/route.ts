import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseQuery } from "@/lib/api/parse";
import { created, paginated } from "@/lib/api/response";
import { MOCK_DATE, mockId, mockPage } from "@/lib/mock";
import { MOCK_EVENT_LIST } from "@/features/events/mocks";
import { createEventSchema, listEventsQuerySchema, type EventDto } from "@/features/events/schemas";

/** Liste paginée des événements. Rôles : admin, agent. */
export const GET = defineRoute(["admin", "agent"], async ({ request }) => {
  const query = parseQuery(request, listEventsQuerySchema);

  // TODO(events): implémenter — recherche `q`, tri, pagination via features/events/service.ts
  const { items, meta } = mockPage(MOCK_EVENT_LIST, query);
  return paginated(items, meta);
});

/** Crée un événement. Rôles : admin. */
export const POST = defineRoute(["admin"], async ({ request }) => {
  const input = await parseBody(request, createEventSchema);

  // TODO(events): implémenter — insérer en base via features/events/service.ts
  const event: EventDto = {
    id: mockId(999),
    description: null,
    location: null,
    ...input,
    badgeBackgroundUrl: null,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  };
  return created(event);
});
