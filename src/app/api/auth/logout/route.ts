import { headers } from "next/headers";

import { defineRoute } from "@/lib/api/define-route";
import { noContent } from "@/lib/api/response";
import { auth } from "@/lib/auth/auth";

/** Déconnexion : supprime la session et le cookie. Rôles : admin, agent. */
export const POST = defineRoute(["admin", "agent"], async () => {
  await auth.api.signOut({ headers: await headers() });
  return noContent();
});
