import type { Metadata } from "next";
import HomeDashboard from "@/components/home/HomeDashboard";
export const metadata: Metadata = {
  title: { absolute: "Home | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <HomeDashboard />;
}
