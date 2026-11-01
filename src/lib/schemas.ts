import { z } from "zod";

/** Briques Zod communes à toutes les features. */

export const idSchema = z.uuid();
export const idParamsSchema = z.object({ id: idSchema });

/** Date-heure ISO 8601 (`2026-11-05T18:30:00.000Z`). Les décalages `+01:00` sont acceptés en entrée. */
export const dateTimeSchema = z.iso.datetime({ offset: true });

export const sortOrderSchema = z.enum(["asc", "desc"]);

/** Texte de recherche libre (`?q=`). */
export const searchSchema = z.string().trim().min(1).max(100);

/** Email normalisé : espaces retirés, minuscules, puis validé. */
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

/** Texte optionnel : peut être omis ou `null` (le service convertit "" en null). */
export const optionalText = (max: number) => z.string().trim().max(max).nullish();

/** Couleur hexadécimale SANS `#` (ex. `1a2b3c`), pratique dans une URL. */
export const hexColorSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{6}$/, "Couleur hexadécimale à 6 chiffres, sans #");

/** Référence minimale vers un utilisateur (ex. l'agent qui a scanné). */
export const userRefSchema = z.object({ id: idSchema, name: z.string() });
export type UserRef = z.infer<typeof userRefSchema>;

/** Rend un schéma `.partial()` invalide s'il ne contient aucun champ (PATCH vide). */
export function atLeastOneField<T extends z.ZodObject>(schema: T) {
  return schema.refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Au moins un champ à modifier est requis",
  });
}

/** Fichier envoyé en multipart/form-data. */
export function fileSchema(options: { maxBytes: number; mimeTypes: readonly string[] }) {
  return z
    .instanceof(File, { message: "Fichier requis" })
    .refine((file) => file.size > 0, "Fichier vide")
    .refine((file) => file.size <= options.maxBytes, {
      message: `Fichier trop volumineux (max ${Math.round(options.maxBytes / 1024 / 1024)} Mo)`,
    })
    .refine((file) => options.mimeTypes.includes(file.type), {
      message: `Type de fichier non supporté (attendu : ${options.mimeTypes.join(", ")})`,
    });
}
