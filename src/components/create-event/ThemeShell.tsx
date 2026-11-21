import type { ReactNode } from "react";

import { Ambient, AMBIENT_BY_THEME, type AmbientKind } from "./ambient";
import CanvasMode from "./CanvasMode";
import { Effect } from "./themeEffects";
import { ART, ArtBackdrop } from "./themeArt";
import { Scene, SCENE_BASE, SCENE_BY_THEME } from "./scenes";
import { fixedLayer, NOISE } from "./themeLayers";
import { themes, themeStyle } from "./themes";
import type { EventDraft } from "./draft";

/**
 * Page shell for every themed screen: resolves the theme, the background art,
 * the ambient scene and the chosen effect, then paints the content on top.
 */

export default function ThemeShell({
  draft,
  children,
  workspace = false,
}: {
  draft: EventDraft;
  children: ReactNode;
  workspace?: boolean;
}) {
  const theme = themes.find((t) => t.id === draft.themeId) ?? themes[0];

  const art = ART[draft.themeId];
  const sceneId = SCENE_BY_THEME[draft.themeId];
  const own = SCENE_BASE[draft.themeId];

  const mode = art?.mode ?? own?.mode ?? theme.mode;

  const ambient: AmbientKind =
    AMBIENT_BY_THEME[draft.themeId] ?? (mode === "dark" ? "smoke" : "warm");

  /* The page's own paint: the theme's base colour and gradient, or the poster
     colour and photo the organizer picked instead. Painting it on a fixed layer
     puts the same colours under the whole viewport, chrome included, so the
     workspace rail beside the canvas never shows a seam. */
  const pageStyle = {
    ...themeStyle(theme, true),
    ...(draft.background ? { backgroundColor: draft.background } : {}),
    ...(draft.themeImage ? { backgroundImage: draft.themeImage } : {}),
  };

  /* Softer than pure black on white: warm ink on light pages, warm off-white on
     dark ones, so long reading is comfortable on the eyes. */
  const ink = mode === "dark" ? "#efe9df" : "#2a2622";

  return (
    <div
      className={`ev relative min-h-dvh overflow-x-clip font-sans ${
        workspace ? "workspace-theme" : ""
      }`}
      /* Inside the workspace the organizer appearance wins, so the event palette
         is deliberately not applied here: it stays on the poster, the preview
         cards and (for guests) the public invitation. */
      data-mode={workspace ? undefined : mode}
      style={
        workspace
          ? undefined
          : {
              ...pageStyle,
              color: ink,
            }
      }
    >
      {/* A themed screen paints the whole viewport, so the chrome beside it
          follows this canvas rather than the stored appearance. */}
      {!workspace && <CanvasMode mode={mode} />}

      {!workspace && <div aria-hidden className={fixedLayer} style={pageStyle} />}

      {/* Decorative event layers belong to the invitation, not to the
          organizer's own dashboard. */}
      {!workspace && own && (
        <div
          aria-hidden
          className={fixedLayer}
          style={{ background: own.base }}
        />
      )}

      {!workspace && art && <ArtBackdrop spec={art} />}

      {!workspace && !art && !own && !sceneId && (
        <div aria-hidden className="ev-atmosphere" />
      )}

      {!workspace && sceneId && <Scene id={sceneId} />}

      {!workspace && !art && !sceneId && <Ambient kind={ambient} />}

      {/* Finish: fine film grain and a quiet vignette over every themed page.
          This is what makes a gradient read as a lit surface rather than a fill. */}
      {!workspace && (
        <>
          <div
            aria-hidden
            className={`${fixedLayer} opacity-[.11] mix-blend-overlay`}
            style={{ backgroundImage: NOISE }}
          />
          <div
            aria-hidden
            className={fixedLayer}
            style={{
              background:
                mode === "dark"
                  ? "radial-gradient(ellipse at 50% 38%, transparent 55%, rgba(0,0,0,.4))"
                  : "radial-gradient(ellipse at 50% 38%, transparent 60%, rgba(80,58,32,.11))",
            }}
          />
        </>
      )}

      {!workspace && <Effect id={draft.effectId} />}

      {/* The page's content, and deliberately *not* a stacking context.
          `relative` alone keeps it above the art layers — they are `z-0` and
          come first in the document — while a dialog inside the page (`fixed`,
          `z-50` and up) can still outrank the app's chrome at `z-40`. A `z-10`
          here capped every dialog on a themed page below the tab bar: on a
          phone the RSVP sheet's send button was painted over by the dock, and
          the reminder and pass dialogs went the same way. */}
      <div className="relative">{children}</div>
    </div>
  );
}