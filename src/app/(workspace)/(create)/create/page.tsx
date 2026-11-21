import type { Metadata } from "next";

import CreateEventPage from "@/components/create-event/CreateEventPage";

export const metadata: Metadata = {
  title: { absolute: "Create your event | Arvent" },
  description:
    "Add the details, pick a poster and get one link to share. Know who's actually coming.",
};

export default function Page() {
  return <CreateEventPage />;
}

