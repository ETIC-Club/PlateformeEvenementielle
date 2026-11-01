import { defineRoute } from "@/lib/api/define-route";
import { parseParams, parseQuery } from "@/lib/api/parse";
import { fileResponse } from "@/lib/api/response";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_PNG, MOCK_SVG } from "@/lib/mock-files";
import { participantIdParamsSchema } from "@/features/participants/schemas";
import { qrOptionsQuerySchema } from "@/features/qr/schemas";

/**
 * Image du QR code d'un participant (PNG ou SVG), personnalisable par la query string
 * (size, color, background, margin, format). `?download=true` force le téléchargement.
 * Rôles : admin. Erreurs : 400, 404.
 */
export const GET = defineRoute<{ id: string }>(["admin"], async ({ request, params }) => {
  const { id } = parseParams(params, participantIdParamsSchema);
  const options = parseQuery(request, qrOptionsQuerySchema);

  // TODO(qr): implémenter — lire le participant, générer le QR de son `qrToken` avec `options`
  mockNotFoundIf(id, "Participant introuvable");
  const isSvg = options.format === "svg";
  return fileResponse(isSvg ? MOCK_SVG : MOCK_PNG, {
    contentType: isSvg ? "image/svg+xml" : "image/png",
    filename: `qr-${id}.${options.format}`,
    inline: !options.download,
  });
});
