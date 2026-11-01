import { del, put } from "@vercel/blob";

import { env } from "@/lib/env";

import type { PutOptions, StorageProvider, StoredFile } from "./types";

/** Implémentation Vercel Blob. Nécessite la variable `BLOB_READ_WRITE_TOKEN`. */
export class VercelBlobStorage implements StorageProvider {
  private get token(): string {
    const token = env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN manquant : créez un Blob store sur Vercel et ajoutez le token dans .env.local (voir README > Stockage).",
      );
    }
    return token;
  }

  async put(
    pathname: string,
    body: Blob | ArrayBuffer | Uint8Array,
    options: PutOptions,
  ): Promise<StoredFile> {
    if (pathname.includes("..") || pathname.startsWith("/")) {
      throw new Error(`Chemin de stockage invalide : ${pathname}`);
    }
    const payload = body instanceof Uint8Array ? new Blob([new Uint8Array(body)]) : body;
    const result = await put(pathname, payload, {
      access: "public",
      token: this.token,
      contentType: options.contentType,
      addRandomSuffix: options.randomSuffix ?? true,
    });
    return {
      url: result.url,
      pathname: result.pathname,
      contentType: options.contentType,
      size: payload instanceof Blob ? payload.size : payload.byteLength,
    };
  }

  async delete(url: string): Promise<void> {
    await del(url, { token: this.token });
  }
}
