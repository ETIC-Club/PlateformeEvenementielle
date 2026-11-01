import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  /** Secret de signature des sessions (32 caractères minimum). Générer : `openssl rand -base64 32`. */
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET doit faire au moins 32 caractères"),
  /** URL publique de l'application (ex. https://mon-club.vercel.app). Défaut : détectée. */
  BETTER_AUTH_URL: z.url().optional(),
  /** Token Vercel Blob (stockage des fichiers). Requis seulement pour les uploads. */
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) return parsed.data;

  // Pendant `next build`, les variables peuvent être absentes (elles sont lues au runtime).
  if (process.env.NEXT_PHASE === "phase-production-build") return process.env as unknown as Env;

  const problems = Object.entries(z.flattenError(parsed.error).fieldErrors)
    .map(([key, messages]) => `  - ${key} : ${messages?.join(", ")}`)
    .join("\n");
  throw new Error(
    `Variables d'environnement invalides ou manquantes :\n${problems}\n` +
      "Copiez .env.example vers .env.local et renseignez les valeurs.",
  );
}

/** Variables d'environnement validées. Importer `env` plutôt que lire `process.env`. */
export const env = loadEnv();
