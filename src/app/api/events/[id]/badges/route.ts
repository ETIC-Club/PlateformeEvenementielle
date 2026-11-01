import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { fileResponse } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_PDF } from "@/lib/mock-files";
import { generateBadgesBodySchema } from "@/features/badges/schemas";
import { eventIdParamsSchema } from "@/features/events/schemas";

/**
 * Génère UN PDF contenant les badges (une page par participant). Corps : `{ participantIds? }`
 * (tous les participants si omis, 500 max par appel). Rôles : admin. Erreurs : 400, 404.
 */
export const POST = defineRoute<{ id: string }>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const input = await parseBody(request, generateBadgesBodySchema);

  // TODO(badges): implémenter — rendre les badges (fond + infos + QR) et assembler le PDF
  mockNotFoundIf(eventId, "Événement introuvable");
  void input;
  return fileResponse(MOCK_PDF, {
    contentType: "application/pdf",
    filename: `badges-${eventId}.pdf`,
  });
});
