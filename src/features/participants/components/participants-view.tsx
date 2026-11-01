import { EmptyState } from "@/components/common/state-views";
import { PageHeader } from "@/components/common/page-header";

// TODO(participants): implémenter — Page participants (tableau, recherche, filtres, formulaire), UI d'import Excel et export.
export function ParticipantsView() {
  return (
    <>
      <PageHeader
        title="Participants"
        description="Liste, recherche, filtres, import et export des participants."
      />
      <EmptyState
        title="Page à implémenter"
        description="Cette page est protégée et routée ; son contenu reste à développer."
      />
    </>
  );
}
