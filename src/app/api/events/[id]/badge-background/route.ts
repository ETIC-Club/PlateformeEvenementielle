import { defineRoute } from "@/lib/api/define-route";
import { parseFormFile, parseParams } from "@/lib/api/parse";
import { noContent, ok } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { badgeBackgroundFileSchema, type BadgeBackgroundDto } from "@/features/badges/schemas";
import { eventIdParamsSchema } from "@/features/events/schemas";

type Params = { id: string }; // id de l'ÉVÉNEMENT

/**
 * Envoie (ou remplace) l'image de fond des badges, champ multipart `file` (PNG / JPEG / WebP, 5 Mo max).
 * Rôles : admin. Erreurs : 400, 404.
 */
export const PUT = defineRoute<Params>(["admin"], async ({ request, params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);
  const file = await parseFormFile(request, "file", badgeBackgroundFileSchema);

  // TODO(badges): implémenter — stocker via lib/storage, enregistrer l'URL dans events.badgeBackgroundUrl
  mockNotFoundIf(eventId, "Événement introuvable");
  void file;
  return ok<BadgeBackgroundDto>({
    badgeBackgroundUrl: `https://example.public.blob.vercel-storage.com/badges/${eventId}.png`,
  });
});

/** Retire le fond personnalisé (retour au badge par défaut). Rôles : admin. Erreurs : 404. */
export const DELETE = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id: eventId } = parseParams(params, eventIdParamsSchema);

  // TODO(badges): implémenter — supprimer le fichier du stockage et mettre l'URL à null
  mockNotFoundIf(eventId, "Événement introuvable");
  return noContent();
});
