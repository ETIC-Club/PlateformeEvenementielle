import { EmptyState } from "@/components/common/state-views";
import { PageHeader } from "@/components/common/page-header";

// TODO(events): implémenter — Page événements (liste, formulaire, suppression).
export function EventsView() {
  return (
    <>
      <PageHeader
        title="Événements"
        description="Créer, modifier et supprimer les événements du club."
      />
      <EmptyState
        title="Page à implémenter"
        description="Cette page est protégée et routée ; son contenu reste à développer."
      />
    </>
  );
}
