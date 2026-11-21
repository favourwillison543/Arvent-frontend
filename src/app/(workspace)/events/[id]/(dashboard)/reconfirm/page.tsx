import type { Metadata } from "next";

import ReconfirmPanel from "@/components/reconfirmation/ReconfirmPanel";

export const metadata: Metadata = {
  title: { absolute: "Reconfirm guests | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <ReconfirmPanel />;
}
