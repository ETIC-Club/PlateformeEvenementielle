import { defineRoute } from "@/lib/api/define-route";
import { parseParams, parseQuery } from "@/lib/api/parse";
import { fileResponse } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_ZIP } from "@/lib/mock-files";
import { eventIdParamsSchema } from "@/features/events/schemas";
import { qrOptionsQuerySchema } from "@/features/qr/schemas";

/**
 * Téléchargement en masse : archive ZIP des QR codes de tous les participants de l'événement
 * (un fichier `<nom>-<prénom>.<format>` par participant), mêmes options que le QR unitaire.
 * Rôles : admin. Erreurs : 400, 404.
 */
export const GET = defineRoute<{ id: string }>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  parseQuery(request, qrOptionsQuerySchema);

  // TODO(qr): implémenter — générer tous les QR et les zipper (en flux si possible)
  mockNotFoundIf(eventId, "Événement introuvable");
  return fileResponse(MOCK_ZIP, {
    contentType: "application/zip",
    filename: `qr-codes-${eventId}.zip`,
  });
});
