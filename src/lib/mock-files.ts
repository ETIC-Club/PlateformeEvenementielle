/**
 * Fichiers factices renvoyés par les stubs de téléchargement (QR, badges, export…).
 * Ils ont le bon Content-Type mais un contenu minimal : l'équipe les remplace par la vraie génération.
 */

const fromBase64 = (value: string) => new Uint8Array(Buffer.from(value, "base64"));

/** PNG 1×1 pixel noir. */
export const MOCK_PNG = fromBase64(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
);

export const MOCK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#000"/></svg>';

/** PDF d'une page blanche. */
export const MOCK_PDF = new TextEncoder().encode(
  "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 283 425]>>endobj\n" +
    "trailer<</Root 1 0 R/Size 4>>\n%%EOF\n",
);

/** Archive ZIP vide (22 octets : fin de répertoire central). */
export const MOCK_ZIP = new Uint8Array([0x50, 0x4b, 0x05, 0x06, ...new Array(18).fill(0)]);

export const MOCK_CSV =
  "Prénom;Nom;Email;Téléphone;Organisation;Fonction\r\nAmina;Benali;amina.benali@example.com;+213550000001;ESI Alger;Étudiante\r\n";
