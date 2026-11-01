import { defineRoute } from "@/lib/api/define-route";
import { parseFormFile, parseParams, parseQuery } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { fileSchema } from "@/lib/schemas";
import { mockNotFoundIf } from "@/lib/mock";
import { eventIdParamsSchema } from "@/features/events/schemas";
import { MOCK_IMPORT_REPORT } from "@/features/import-export/mocks";
import {
  IMPORT_MAX_BYTES,
  IMPORT_MIME_TYPES,
  importQuerySchema,
  type ImportReportDto,
} from "@/features/import-export/schemas";

type Params = { id: string }; // id de l'ÉVÉNEMENT

/**
 * Import Excel (.xlsx, champ multipart `file`). Importe les lignes valides et renvoie un rapport.
 * `?dryRun=true` : analyse seulement, n'enregistre rien. Rôles : admin. Erreurs : 400, 404.
 * Les lignes en doublon ou en erreur NE font PAS échouer la requête : elles sont dans le rapport.
 */
export const POST = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const { dryRun } = parseQuery(request, importQuerySchema);
  const file = await parseFormFile(
    request,
    "file",
    fileSchema({ maxBytes: IMPORT_MAX_BYTES, mimeTypes: IMPORT_MIME_TYPES }),
  );

  // TODO(import-export): implémenter — parser `file` (ExcelJS), valider chaque ligne avec
  // createParticipantSchema, détecter les doublons, insérer si !dryRun, construire le rapport.
  mockNotFoundIf(eventId, "Événement introuvable");
  void file;
  return ok<ImportReportDto>({ ...MOCK_IMPORT_REPORT, dryRun });
});
