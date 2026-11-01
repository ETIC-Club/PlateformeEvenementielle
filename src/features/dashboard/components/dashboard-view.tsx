import { EmptyState } from "@/components/common/state-views";
import { PageHeader } from "@/components/common/page-header";

// TODO(dashboard): implémenter — Page dashboard (stats, polling).
export function DashboardView() {
  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Statistiques de participation par événement et par session."
      />
      <EmptyState
        title="Page à implémenter"
        description="Cette page est protégée et routée ; son contenu reste à développer."
      />
    </>
  );
}
