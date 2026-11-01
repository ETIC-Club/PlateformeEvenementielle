import { defineRoute } from "@/lib/api/define-route";
import { parseParams } from "@/lib/api/parse";
import { fileResponse } from "@/lib/api/response";
import { MOCK_ZIP } from "@/lib/mock-files";
import { eventIdParamsSchema } from "@/features/events/schemas";

/** Télécharge le modèle Excel vide (en-têtes IMPORT_COLUMNS). Rôles : admin. */
export const GET = defineRoute<{ id: string }>(["admin"], async ({ params }) => {
  parseParams(params, eventIdParamsSchema);

  // TODO(import-export): implémenter — générer un vrai .xlsx avec les en-têtes IMPORT_COLUMNS
  return fileResponse(MOCK_ZIP, {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: "modele-import-participants.xlsx",
  });
});
