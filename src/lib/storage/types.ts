/**
 * Abstraction du stockage de fichiers.
 *
 * Vercel n'a pas de disque persistant : ne JAMAIS utiliser `fs` pour enregistrer un upload.
 * Toute la plateforme passe par `getStorage()` (voir `index.ts`). Pour changer de fournisseur
 * (S3, Supabase Storage…), il suffit d'écrire une nouvelle classe qui implémente `StorageProvider`.
 */

export type PutOptions = {
  contentType: string;
  /** `true` (défaut) : un suffixe aléatoire est ajouté au nom, ce qui évite les écrasements et les URLs devinables. */
  randomSuffix?: boolean;
};

export type StoredFile = {
  /** URL publique de lecture, à enregistrer en base (ex. `events.badge_background_url`). */
  url: string;
  /** Chemin logique du fichier (ex. `badges/<eventId>/fond.png`). */
  pathname: string;
  contentType: string;
  size: number;
};

export interface StorageProvider {
  /** Enregistre un fichier. `pathname` est un chemin relatif sans `..` (ex. `badges/<eventId>/fond.png`). */
  put(
    pathname: string,
    body: Blob | ArrayBuffer | Uint8Array,
    options: PutOptions,
  ): Promise<StoredFile>;
  /** Supprime un fichier à partir de son URL. Sans erreur s'il n'existe plus. */
  delete(url: string): Promise<void>;
}
