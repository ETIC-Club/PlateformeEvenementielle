import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { noContent, ok } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_SCAN_SESSION } from "@/features/scan-sessions/mocks";
import {
  scanSessionIdParamsSchema,
  updateScanSessionSchema,
  type ScanSessionDto,
} from "@/features/scan-sessions/schemas";

type Params = { id: string };

/** Détail d'une session de scan. Rôles : admin, agent. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin", "agent"], async ({ params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);

  // TODO(scan-sessions): implémenter — lire la session (404 si absente)
  mockNotFoundIf(id, "Session introuvable");
  return ok<ScanSessionDto>({ ...MOCK_SCAN_SESSION, id });
});

/** Modifie une session (nom, type, `isActive` pour la fermer / rouvrir). Rôles : admin. Erreurs : 400, 404, 409. */
export const PATCH = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);
  const input = await parseBody(request, updateScanSessionSchema);

  // TODO(scan-sessions): implémenter — mettre à jour ; 409 si le nouveau nom existe déjà
  mockNotFoundIf(id, "Session introuvable");
  return ok<ScanSessionDto>({ ...MOCK_SCAN_SESSION, ...input, id });
});

/** Supprime une session et son historique de scans. Rôles : admin. Erreurs : 404. */
export const DELETE = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);

  // TODO(scan-sessions): implémenter — supprimer (404 si absente)
  mockNotFoundIf(id, "Session introuvable");
  return noContent();
});
