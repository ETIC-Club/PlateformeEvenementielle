import type { NextRequest } from "next/server";
import { z } from "zod";

import { ValidationError } from "@/lib/errors";

function parseWith<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Données invalides", z.flattenError(result.error));
  }
  return result.data;
}

/** Valide le corps JSON de la requête. */
export async function parseBody<S extends z.ZodType>(
  request: NextRequest,
  schema: S,
): Promise<z.output<S>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ValidationError("Corps JSON invalide");
  }
  return parseWith(schema, json);
}

/** Valide les paramètres de query string (`?page=2&q=abc`). */
export function parseQuery<S extends z.ZodType>(request: NextRequest, schema: S): z.output<S> {
  return parseWith(schema, Object.fromEntries(request.nextUrl.searchParams));
}

/** Valide les paramètres de chemin (`/events/[id]`). */
export function parseParams<S extends z.ZodType>(params: unknown, schema: S): z.output<S> {
  return parseWith(schema, params);
}

/** Récupère et valide un fichier d'un envoi multipart (`<input type="file" name="file">`). */
export async function parseFormFile<S extends z.ZodType>(
  request: NextRequest,
  field: string,
  schema: S,
): Promise<z.output<S>> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new ValidationError("Envoi multipart/form-data attendu");
  }
  return parseWith(schema, form.get(field));
}
