
import type { ReactNode } from "react";
import OrganizerWorkspace from "@/components/home/OrganizerWorkspace";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganizerWorkspace>{children}</OrganizerWorkspace>;
}
