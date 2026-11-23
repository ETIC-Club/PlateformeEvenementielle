import { EventShell } from "@/features/events/components/event-shell";

// Cadre commun des pages d'un événement (en-tête + onglets). Contenu dans features/events/components.
export default async function EventLayout({ children, params }: LayoutProps<"/events/[id]">) {
  const { id } = await params;
  return <EventShell eventId={id}>{children}</EventShell>;
}
