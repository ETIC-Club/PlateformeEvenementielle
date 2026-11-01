import { defineRoute } from "@/lib/api/define-route";
import { parseParams, parseQuery } from "@/lib/api/parse";
import { fileResponse } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_PDF } from "@/lib/mock-files";
import { badgeDownloadQuerySchema } from "@/features/badges/schemas";
import { participantIdParamsSchema } from "@/features/participants/schemas";

/** Badge PDF d'un participant (aperçu ou `?download=true`). Rôles : admin. Erreurs : 404. */
export const GET = defineRoute<{ id: string }>(["admin"], async ({ request, params }) => {
  const { id } = parseParams(params, participantIdParamsSchema);
  const { download } = parseQuery(request, badgeDownloadQuerySchema);

  // TODO(badges): implémenter — rendre le badge (fond de l'événement + infos + QR) en PDF
  mockNotFoundIf(id, "Participant introuvable");
  return fileResponse(MOCK_PDF, {
    contentType: "application/pdf",
    filename: `badge-${id}.pdf`,
    inline: !download,
  });
});
