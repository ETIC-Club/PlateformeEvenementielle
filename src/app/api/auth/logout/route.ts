import { defineRoute } from "@/lib/api/define-route";
import { noContent } from "@/lib/api/response";

/** Déconnexion : supprime la session. Rôles : admin, agent. */
export const POST = defineRoute(["admin", "agent"], async () => {
  // TODO(auth): implémenter — invalider la session Better Auth et effacer le cookie.
  return noContent();
});
