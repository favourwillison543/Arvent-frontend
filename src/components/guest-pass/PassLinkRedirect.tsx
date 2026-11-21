"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * `/pass#token=agp_…` — the address the emails have always used.
 *
 * A fragment never reaches the server, so there is no `/pass` page that can
 * read it while rendering: this one reads it in the browser and forwards to
 * `/pass/<token>`, which is the address the app reads. Both spellings are
 * accepted, because the token has been sent as a query on some links and as a
 * fragment on others, and a guest clicking an email from last week must not be
 * told their pass does not exist.
 */
export function PassLinkRedirect() {
  const router = useRouter();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash.slice(1);
    const fragment = new URLSearchParams(hash);

    const token =
      fragment.get("token") ||
      fragment.get("g") ||
      fragment.get("guestToken") ||
      search.get("token") ||
      search.get("g") ||
      search.get("guestToken") ||
      // A bare `/pass#agp_…`, which is what a truncated link looks like.
      (hash.startsWith("agp_") ? hash : "");

    if (!token) {
      // Decided a tick later, not inside the effect body: the first paint must
      // stay the spinner the server sent, and the answer only exists in the
      // browser's copy of the address.
      const id = window.setTimeout(() => setMissing(true), 0);
      return () => window.clearTimeout(id);
    }

    const slug = fragment.get("e") || search.get("e");
    const target = `/pass/${encodeURIComponent(token)}${
      slug ? `?e=${encodeURIComponent(slug)}` : ""
    }`;

    // Replace, not push: the fragment is a credential and the back button
    // should not return to it.
    router.replace(target);
  }, [router]);

  if (missing) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl font-bold">
            This pass link is incomplete
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The link seems to be cut off mail apps sometimes shorten long
            addresses. Open it again from the button in your email, or ask the
            host for a new link.
          </p>
          <Button href="/" variant="outline" className="mt-5">
            Back to Arvent
          </Button>
        </div>
      </main>
    );
  }

  return <LoadingScreen />;
}
