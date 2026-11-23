import type { ReactNode } from "react";

// TODO(events): implémenter — cadre commun des pages d'un événement : en-tête (nom, date, lieu) et onglets
// Aperçu (/events/[id]) · Participants · Sessions de scan · QR & badges. À livrer EN PREMIER :
// les autres onglets en dépendent. Doit afficher `children` sous les onglets.
export function EventShell({ eventId, children }: { eventId: string; children: ReactNode }) {
  void eventId;
  return children;
}
