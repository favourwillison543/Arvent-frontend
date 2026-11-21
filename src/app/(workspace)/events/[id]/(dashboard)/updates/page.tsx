import type { Metadata } from "next";
import UpdatesPage from "@/components/event-dashboard/UpdatesPage";

export const metadata: Metadata = {
  title: { absolute: "Event updates | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <UpdatesPage />;
}
