import type { Metadata } from "next";

import SettingsPage from "@/components/home/SettingsPage";

export const metadata: Metadata = {
  title: { absolute: "Settings | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <SettingsPage />;
}
