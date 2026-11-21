import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EmailPreviewPage from "@/components/email/EmailPreviewPage";

/* A design tool, not a page of the product: it exists in development so the
   emails can be reviewed at a desktop and a phone width, and it is a 404 in a
   production build. */
export const metadata: Metadata = {
  title: { absolute: "Email design | Arvent" },
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <EmailPreviewPage />;
}
