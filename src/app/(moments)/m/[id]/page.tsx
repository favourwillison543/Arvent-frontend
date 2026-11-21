import type { Metadata } from "next";

import MomentPage from "@/components/moments/MomentPage";

export const metadata: Metadata = {
  title: { absolute: "A Moment on Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <MomentPage />;
}