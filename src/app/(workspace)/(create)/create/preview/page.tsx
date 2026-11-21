import EventPreviewPage from "@/components/create-event/EventPreviewPage";
import type { Metadata } from "next";

// Adjust to wherever the create-event folder lives

export const metadata: Metadata = {
  title: { absolute: "Event preview | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <EventPreviewPage />;
}
