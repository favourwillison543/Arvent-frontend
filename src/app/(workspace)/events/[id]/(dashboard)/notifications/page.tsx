import type { Metadata } from "next";

import NotificationSettingsPage from "@/components/event-dashboard/NotificationSettingsPage";

export const metadata: Metadata = {
  title: { absolute: "Notifications | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <NotificationSettingsPage />;
}
