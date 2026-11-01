import { EmptyState } from "@/components/common/state-views";
import { PageHeader } from "@/components/common/page-header";

// TODO(users): implémenter — Page de gestion des comptes (liste, ajout).
export function UsersView() {
  return (
    <>
      <PageHeader
        title="Comptes"
        description="Gérer les comptes administrateurs et agents de scan."
      />
      <EmptyState
        title="Page à implémenter"
        description="Cette page est protégée et routée ; son contenu reste à développer."
      />
    </>
  );
}
