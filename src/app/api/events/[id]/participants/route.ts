import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams, parseQuery } from "@/lib/api/parse";
import { created, paginated } from "@/lib/api/response";
import { MOCK_DATE, mockId, mockNotFoundIf, mockPage } from "@/lib/mock";
import { eventIdParamsSchema } from "@/features/events/schemas";
import { MOCK_PARTICIPANTS } from "@/features/participants/mocks";
import {
  createParticipantSchema,
  listParticipantsQuerySchema,
  type ParticipantDto,
} from "@/features/participants/schemas";

type Params = { id: string }; // id de l'ÉVÉNEMENT

/** Participants d'un événement : recherche, filtre, tri, pagination. Rôles : admin. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const query = parseQuery(request, listParticipantsQuerySchema);

  // TODO(participants): implémenter — filtres q / organization, tri, pagination
  mockNotFoundIf(eventId, "Événement introuvable");
  const { items, meta } = mockPage(
    MOCK_PARTICIPANTS.map((participant) => ({ ...participant, eventId })),
    query,
  );
  return paginated(items, meta);
});

/** Crée un participant (le `qrToken` est généré). Rôles : admin. Erreurs : 400, 404, 409 (email déjà inscrit). */
export const POST = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const input = await parseBody(request, createParticipantSchema);

  // TODO(participants): implémenter — insérer ; 409 CONFLICT si (eventId, email) existe déjà
  mockNotFoundIf(eventId, "Événement introuvable");
  const participant: ParticipantDto = {
    phone: null,
    organization: null,
    jobTitle: null,
    ...input,
    id: mockId(998),
    eventId,
    qrToken: "mock-token-new".padEnd(32, "x"),
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  };
  return created(participant);
});
