import type { ReactNode } from "react";

import Footer from "@/components/landing/Footer";
import Navbar from "@/components/layout/Navbar";

export default function MomentsSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
