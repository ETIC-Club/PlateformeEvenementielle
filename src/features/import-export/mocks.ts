import type { ImportReportDto } from "./schemas";

// Données factices des stubs d'API. À supprimer quand la feature est implémentée.

export const MOCK_IMPORT_REPORT: Omit<ImportReportDto, "dryRun"> = {
  totalRows: 6,
  validRows: 3,
  duplicates: [
    { row: 5, email: "amina.benali@example.com", reason: "already_registered" },
    { row: 7, email: "yacine.boudiaf@example.com", reason: "in_file" },
  ],
  errors: [{ row: 4, field: "email", message: "Adresse email invalide" }],
};
