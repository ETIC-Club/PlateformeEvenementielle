import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

/**
 * Instance Better Auth (côté serveur uniquement).
 *
 * Volontairement NON exposée en HTTP : le front passe par nos routes `/api/auth/login|logout|me`
 * (enveloppe de réponse standard) qui appellent `auth.api.*`. Pas d'inscription publique.
 */
// Pendant `next build` les variables peuvent être absentes (lues au runtime) : secret factice, jamais utilisé.
const secret =
  env.BETTER_AUTH_SECRET ||
  (process.env.NEXT_PHASE === "phase-production-build"
    ? "build-phase-placeholder-secret-0000"
    : "");

export const auth = betterAuth({
  secret,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/better-auth",
  database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "agent", input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    // Le rôle est lu dans un cookie signé (5 min) : évite une requête DB à chaque navigation.
    // Conséquence : un changement de rôle met jusqu'à 5 min à s'appliquer.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  advanced: { database: { generateId: "uuid" } },
  plugins: [username(), nextCookies()],
});
