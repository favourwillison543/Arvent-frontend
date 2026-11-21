"use client";

import type { ReactNode } from "react";

import EventDashboardShell from "@/components/event-dashboard/EventDashboardShell";

/**
 * Everything under this layout shares one mounted event surface: the hero,
 * the section tabs, the action rail and the dashboard data. Navigating
 * between Overview / Guests / Reconfirm / Memories swaps only the panel.
 * Door check-in lives outside the group because it is a full-screen screen.
 */
export default function EventDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <EventDashboardShell>{children}</EventDashboardShell>;
}
