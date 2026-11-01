import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
});

/** Variables d'environnement validées. Importer `env` plutôt que lire `process.env`. */
export const env = envSchema.parse(process.env);
