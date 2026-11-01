import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams, parseQuery } from "@/lib/api/parse";
import { ok, paginated } from "@/lib/api/response";
import { mockNotFoundIf, mockPage } from "@/lib/mock";
import { MOCK_SCAN_HISTORY, mockScanResult } from "@/features/scan/mocks";
import {
  listScansQuerySchema,
  scanRequestSchema,
  type ScanResultDto,
} from "@/features/scan/schemas";
import { scanSessionIdParamsSchema } from "@/features/scan-sessions/schemas";

type Params = { id: string }; // id de la SESSION de scan

/** Historique des scans de la session (récents d'abord), paginé. Rôles : admin, agent. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin", "agent"], async ({ request, params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);
  const query = parseQuery(request, listScansQuerySchema);

  // TODO(scan): implémenter — jointure scans / participants / utilisateurs, filtres q et scannedBy
  mockNotFoundIf(id, "Session introuvable");
  const { items, meta } = mockPage(MOCK_SCAN_HISTORY, query);
  return paginated(items, meta);
});

/**
 * Valide un token lu dans un QR code. Renvoie TOUJOURS 200 avec `status` = "valid" | "already_scanned"
 * | "invalid" (voir ScanResultDto). Rôles : admin, agent. Erreurs : 400 (token absent), 404 (session).
 *
 * Stub : token "already-scanned" → already_scanned ; token commençant par "invalid" → invalid ; sinon valid.
 */
export const POST = defineRoute<Params>(["admin", "agent"], async ({ request, params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);
  const { token } = await parseBody(request, scanRequestSchema);

  // TODO(scan): implémenter — voir le diagramme de séquence de docs/DATABASE.md
  // (INSERT … ON CONFLICT DO NOTHING pour détecter les doublons ; vérifier événement + session active).
  mockNotFoundIf(id, "Session introuvable");
  return ok<ScanResultDto>(mockScanResult(token));
});
