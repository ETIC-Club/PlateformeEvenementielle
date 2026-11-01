import { EmptyState } from "@/components/common/state-views";
import { PageHeader } from "@/components/common/page-header";

// TODO(badges): implémenter — Page QR (téléchargement, options) et page badges (fond, aperçu, PDF).
export function BadgesView() {
  return (
    <>
      <PageHeader
        title="QR codes & badges"
        description="Télécharger les QR codes, importer un fond et générer les badges PDF."
      />
      <EmptyState
        title="Page à implémenter"
        description="Cette page est protégée et routée ; son contenu reste à développer."
      />
    </>
  );
}
