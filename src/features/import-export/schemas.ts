import { z } from "zod";

// ---- Format du fichier Excel ---------------------------------------------

/**
 * Colonnes du fichier d'import, dans cet ordre. La 1re ligne contient les en-têtes ci-dessous
 * (comparés sans tenir compte de la casse ni des accents). Le modèle téléchargeable et l'export
 * utilisent exactement les mêmes colonnes.
 */
export const IMPORT_COLUMNS = [
  { key: "firstName", header: "Prénom", required: true },
  { key: "lastName", header: "Nom", required: true },
  { key: "email", header: "Email", required: true },
  { key: "phone", header: "Téléphone", required: false },
  { key: "organization", header: "Organisation", required: false },
  { key: "jobTitle", header: "Fonction", required: false },
] as const;

export const IMPORT_MAX_BYTES = 5 * 1024 * 1024; // 5 Mo
export const IMPORT_MAX_ROWS = 2000;
export const IMPORT_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
] as const;

// ---- Entrées -------------------------------------------------------------

/** `?dryRun=true` : analyse le fichier et renvoie le rapport SANS rien enregistrer. */
export const importQuerySchema = z.object({
  dryRun: z.stringbool().default(false),
});
export type ImportQuery = z.infer<typeof importQuerySchema>;

export const exportQuerySchema = z.object({
  format: z.enum(["csv", "xlsx"]).default("csv"),
});
export type ExportQuery = z.infer<typeof exportQuerySchema>;

// ---- Sorties -------------------------------------------------------------

export const importRowErrorSchema = z.object({
  /** Numéro de ligne dans le fichier (1 = en-têtes, 2 = première donnée). */
  row: z.number().int(),
  /** Colonne fautive si identifiable. */
  field: z.enum(IMPORT_COLUMNS.map((column) => column.key) as [string, ...string[]]).nullable(),
  message: z.string(),
});

export const importDuplicateSchema = z.object({
  row: z.number().int(),
  email: z.string(),
  /** `in_file` : déjà présent plus haut dans le fichier ; `already_registered` : déjà inscrit à l'événement. */
  reason: z.enum(["in_file", "already_registered"]),
});

export const importReportSchema = z.object({
  dryRun: z.boolean(),
  /** Lignes de données lues (hors en-têtes). */
  totalRows: z.number().int(),
  /** Lignes valides : enregistrées si `dryRun` est faux, sinon "qui seraient enregistrées". */
  validRows: z.number().int(),
  duplicates: z.array(importDuplicateSchema),
  errors: z.array(importRowErrorSchema),
});
export type ImportReportDto = z.infer<typeof importReportSchema>;
