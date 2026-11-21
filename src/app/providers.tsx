"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { describeError } from "@/lib/http/errorMessage";
import { isFinalError, isSessionExpiredError } from "@/lib/http/errors";
import { notifySessionExpired } from "@/lib/auth/sessionEvents";
import { AppearanceProvider } from "@/components/theme/AppearanceProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialog";

function mutationErrorMessage(error: unknown) {
  return describeError(error);
}

function mutationSuccessMessage(data: unknown) {
  if (!data || typeof data !== "object") return undefined;

  const message = (data as { message?: unknown }).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) {
    const messages = message.filter((item): item is string => typeof item === "string");
    return messages.length ? messages.join(". ") : undefined;
  }

  return undefined;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        /*
         * A read that comes back 401 is an expired session, not a flaky call.
         * `http` already asks for a log in when its refresh fails; this catches
         * the case the client cannot see — a replayed request that was refused
         * again — so the card appears instead of a page that looks signed in.
         */
        queryCache: new QueryCache({
          onError: (error) => {
            if (isSessionExpiredError(error)) notifySessionExpired();
          },
        }),
        mutationCache: new MutationCache({
          onSuccess: (data) => {
            const message = mutationSuccessMessage(data);
            if (message) toast.success(message);
          },
          onError: (error) => {
            if (isSessionExpiredError(error)) notifySessionExpired();
            toast.error(mutationErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            // One retry for a flaky connection; none for an answer that will not
            // change (401, 403, 404) — retrying those only delays the sentence.
            retry: (failureCount, error) =>
              !isFinalError(error) && failureCount < 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider>
        {/* Inside the appearance provider so the sign-in card follows the same
            light/dark choice as the page it floats over. */}
        <AuthDialogProvider>{children}</AuthDialogProvider>
      </AppearanceProvider>
    </QueryClientProvider>
  );
}
