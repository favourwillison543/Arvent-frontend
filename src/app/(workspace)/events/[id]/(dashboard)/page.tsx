import type { Metadata } from "next";

import EventDashboard from "@/components/event-dashboard/EventDashboard";

export const metadata: Metadata = {
  title: { absolute: "Event dashboard | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <EventDashboard />;
}
