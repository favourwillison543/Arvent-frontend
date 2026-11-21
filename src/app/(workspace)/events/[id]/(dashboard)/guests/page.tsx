import type { Metadata } from "next";

import GuestManager from "@/components/guests/GuestsManager";

export const metadata: Metadata = {
  title: { absolute: "Guests | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <GuestManager />;
}
