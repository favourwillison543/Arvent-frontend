import type { Metadata } from "next";

import { PassLinkRedirect } from "@/components/guest-pass/PassLinkRedirect";

/**
 * The pass link without a path token: `/pass#token=agp_…`.
 *
 * The fragment is invisible to the server, so this route is only a doorway —
 * it reads the token in the browser and forwards to `/pass/<token>`, the page
 * that prints. Kept out of search and referrers for the same reason the pass
 * page is.
 */
export const metadata: Metadata = {
  title: { absolute: "Your guest pass | Arvent" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return <PassLinkRedirect />;
}
