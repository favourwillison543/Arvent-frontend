import type { ReactNode } from "react";
import OrganizerGate from "@/components/auth/OrganizerGate";

export default function EventsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganizerGate>{children}</OrganizerGate>;
}
