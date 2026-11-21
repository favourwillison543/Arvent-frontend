import type { Metadata } from "next";

import DiscoverPage from "@/components/discover/DiscoverPage";

export const metadata: Metadata = {
  title: { absolute: "Discover Events | Arvent" },
  description: "Browse public events and find your next plan.",
};

export default function Page() {
  return <DiscoverPage />;
}

