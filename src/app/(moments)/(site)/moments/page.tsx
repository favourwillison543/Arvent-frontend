import type { Metadata } from "next";

import MomentsStart from "@/components/moments/MomentsStart";

export const metadata: Metadata = {
  title: { absolute: "Moments | Arvent" },
  description: "Share something worth remembering. Make a beautiful page and send it with one link.",
};

export default function Page() {
  return <MomentsStart />;
}
