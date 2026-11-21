"use client";

import { useEffect } from "react";

/**
 * Publishes the mode of the canvas a themed screen paints to `<html>`, so the
 * chrome around it (the workspace sidebar, the mobile tab bar) can match it.
 *
 * The organizer's stored appearance alone is not enough: on `/create` the page
 * is a full-bleed event canvas, so with a dark poster theme selected a cream
 * sidebar would sit next to it. Only `dark` changes anything — a light event
 * theme never lightens a dark workspace.
 */
export default function CanvasMode({ mode }: { mode: "light" | "dark" }) {
  useEffect(() => {
    const root = document.documentElement;

    root.dataset.canvas = mode;

    return () => {
      delete root.dataset.canvas;
    };
  }, [mode]);

  return null;
}
