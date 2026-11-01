import { EmptyState } from "@/components/common/state-views";
import { PageHeader } from "@/components/common/page-header";

// TODO(scan): implémenter — Page sessions de scan, interface de scan caméra, historique et suivi scannés / non scannés.
export function ScanView() {
  return (
    <>
      <PageHeader title="Scan" description="Choisir une session de scan et scanner les QR codes." />
      <EmptyState
        title="Page à implémenter"
        description="Cette page est protégée et routée ; son contenu reste à développer."
      />
    </>
  );
}
