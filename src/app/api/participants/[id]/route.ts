import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { noContent, ok } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_PARTICIPANT } from "@/features/participants/mocks";
import {
  participantIdParamsSchema,
  updateParticipantSchema,
  type ParticipantDto,
} from "@/features/participants/schemas";

type Params = { id: string };

/** Détail d'un participant. Rôles : admin. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id } = parseParams(params, participantIdParamsSchema);

  // TODO(participants): implémenter — lire le participant (404 si absent)
  mockNotFoundIf(id, "Participant introuvable");
  return ok<ParticipantDto>({ ...MOCK_PARTICIPANT, id });
});

/** Modifie un participant (champs partiels). Rôles : admin. Erreurs : 400, 404, 409 (email déjà pris). */
export const PATCH = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id } = parseParams(params, participantIdParamsSchema);
  const input = await parseBody(request, updateParticipantSchema);

  // TODO(participants): implémenter — mettre à jour ; 409 si le nouvel email existe déjà dans l'événement
  mockNotFoundIf(id, "Participant introuvable");
  return ok<ParticipantDto>({ ...MOCK_PARTICIPANT, ...input, id });
});

/** Supprime un participant et ses scans. Rôles : admin. Erreurs : 404. */
export const DELETE = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id } = parseParams(params, participantIdParamsSchema);

  // TODO(participants): implémenter — supprimer (404 si absent)
  mockNotFoundIf(id, "Participant introuvable");
  return noContent();
});
