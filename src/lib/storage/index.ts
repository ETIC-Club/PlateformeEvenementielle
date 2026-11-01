import type { StorageProvider } from "./types";
import { VercelBlobStorage } from "./vercel-blob";

export type { PutOptions, StoredFile, StorageProvider } from "./types";

let storage: StorageProvider | undefined;

/**
 * Point d'entrée unique du stockage de fichiers.
 *
 *   const file = await getStorage().put(`badges/${eventId}/fond.png`, buffer, { contentType: "image/png" });
 *   await db.update(events).set({ badgeBackgroundUrl: file.url }) // dans queries.ts
 *   await getStorage().delete(oldUrl);
 */
export function getStorage(): StorageProvider {
  storage ??= new VercelBlobStorage();
  return storage;
}
