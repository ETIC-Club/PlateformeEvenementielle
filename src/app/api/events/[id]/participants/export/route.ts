import { defineRoute } from "@/lib/api/define-route";
import { parseParams, parseQuery } from "@/lib/api/parse";
import { fileResponse } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_CSV, MOCK_ZIP } from "@/lib/mock-files";
import { eventIdParamsSchema } from "@/features/events/schemas";
import { exportQuerySchema } from "@/features/import-export/schemas";

/** Exporte tous les participants de l'événement en CSV ou Excel. Rôles : admin. Erreurs : 404. */
export const GET = defineRoute<{ id: string }>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const { format } = parseQuery(request, exportQuerySchema);

  // TODO(import-export): implémenter — lire les participants et générer le vrai fichier
  mockNotFoundIf(eventId, "Événement introuvable");
  if (format === "xlsx") {
    return fileResponse(MOCK_ZIP, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: "participants.xlsx",
    });
  }
  return fileResponse(`﻿${MOCK_CSV}`, {
    contentType: "text/csv; charset=utf-8",
    filename: "participants.csv",
  });
});
