import DoorScreen from "@/components/gate/door/DoorScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Door check-in | Arvent" },
  robots: { index: false },
};

export default function Page() {
  return <DoorScreen />;
}
