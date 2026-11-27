import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { noContent, ok } from "@/lib/api/response";
import {
  scanSessionIdParamsSchema,
  updateScanSessionSchema,
} from "@/features/scan-sessions/schemas";
import {
  deleteScanSession,
  getScanSession,
  updateScanSession,
} from "@/features/scan-sessions/service";

type Params = { id: string };

/** Détail d'une session de scan. Rôles : admin, agent. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin", "agent"], async ({ params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);
  return ok(await getScanSession(id));
});

/** Modifie une session (nom, type, `isActive` pour la fermer / rouvrir). Rôles : admin. Erreurs : 400, 404, 409. */
export const PATCH = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);
  const input = await parseBody(request, updateScanSessionSchema);
  return ok(await updateScanSession(id, input));
});

/** Supprime une session et son historique de scans. Rôles : admin. Erreurs : 404. */
export const DELETE = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id } = parseParams(params, scanSessionIdParamsSchema);
  await deleteScanSession(id);
  return noContent();
});
