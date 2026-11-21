"use client";

import { Toaster } from "sonner";

import { useAppearance } from "./AppearanceProvider";

/** Sonner renders outside the workspace subtree, so it needs the resolved
    appearance handed to it instead of inheriting the CSS tokens. */
export function AppToaster() {
  const { resolved } = useAppearance();

  return <Toaster position="top-right" richColors theme={resolved} />;
}
