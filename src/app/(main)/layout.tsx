import Footer from "@/components/landing/Footer";
import Navbar from "@/components/layout/Navbar";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "Arvent | Invitations that know who's actually coming",
  },
  description:
    "Share one beautiful link. Guests RSVP without an account, and you see who's confirmed, who changed plans, and who actually showed up.",
  openGraph: {
    title: "Arvent | Invitations that know who's actually coming",
    description:
      "Create your event, send one link, and know who's actually coming.",
    type: "website",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
