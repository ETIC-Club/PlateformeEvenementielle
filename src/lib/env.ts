import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const problems = Object.entries(z.flattenError(parsed.error).fieldErrors)
    .map(([key, messages]) => `  - ${key} : ${messages?.join(", ")}`)
    .join("\n");
  throw new Error(
    `Variables d'environnement invalides ou manquantes :\n${problems}\n` +
      "Copiez .env.example vers .env.local et renseignez les valeurs.",
  );
}

/** Variables d'environnement validées. Importer `env` plutôt que lire `process.env`. */
export const env = parsed.data;
