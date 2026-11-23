
"use client";

import { useEffect, useState } from "react";

import { Poster } from "./Poster";
import { Chip, chipSkin } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { usePixabaySearch, type PixabayImage } from "@/hooks/usePixabaySearch";
import { fonts } from "./themes";
import { posters } from "./posters";
import { whenOf, whereOf } from "./format";
import type { EventDraft, Update } from "./draft";

/* What to ask Pixabay for when a chip is clicked. */
const CHIP_QUERY: Record<string, string> = {
  All: "party",
  Owambe: "african celebration",
  Cookout: "barbecue",
  Formal: "elegant dinner",
  Housewarming: "new home",
  Farewell: "travel goodbye",
  Conference: "business conference",
  "Baby shower": "baby shower",
  Holiday: "holiday celebration",
};

const queryFor = (chip: string) => CHIP_QUERY[chip] ?? chip.toLowerCase();

/* Compress images before saving them to the event. */
const MAX_SIDE = 640;

function compress(dataUrl: string, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();

    img.onload = () => {
      const scale = Math.min(
        1,
        MAX_SIDE / Math.max(img.width, img.height),
      );

      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");

      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0, w, h);

      const out = canvas.toDataURL("image/webp", quality);

      resolve(
        out.startsWith("data:image/webp") && out.length < dataUrl.length
          ? out
          : dataUrl,
      );
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const SKELETON_COUNT = 12;

export default function PosterPicker({
  open,
  onClose,
  draft,
  update,
}: {
  open: boolean;
  onClose: () => void;
  draft: EventDraft;
  update: Update;
}) {
  const [cat, setCat] = useState("All");
  const [typed, setTyped] = useState("");
  const [searched, setSearched] = useState(queryFor("All"));

  const {
    data: images = [],
    isFetching,
    isPlaceholderData,
    error,
  } = usePixabaySearch(searched, open);

  const [importingId, setImportingId] = useState<string | null>(null);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const cats = [
    "All",
    ...Array.from(new Set(posters.map((p) => p.category))),
  ];

  const list = posters.filter(
    (p) => cat === "All" || p.category === cat,
  );

  const font = fonts.find((f) => f.id === draft.fontId) ?? fonts[0];

  const searchError = error instanceof Error ? error.message : "";
  const message = searchError || importError;

  /* Show skeletons only when there are no existing results to display. */
  const showSkeleton =
    isFetching && images.length === 0 && !searchError;

  const pickChip = (chip: string) => {
    setCat(chip);
    setTyped("");
    setImportError("");
    setSearched(queryFor(chip));
  };

  const runSearch = () => {
    const q = typed.trim();
    if (!q) return;

    setImportError("");
    setSearched(q);
  };

  const onUpload = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      update("image", await compress(String(reader.result)));
      onClose();
    };

    reader.readAsDataURL(file);
  };

  /* Import the selected Pixabay illustration. */
  const pickIllustration = async (img: PixabayImage) => {
    setImportingId(img.id);
    setImportError("");

    try {
      const res = await fetch("/api/pixabay/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: img.thumb }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Couldn’t use that image.");
      }

      update("image", await compress(data.dataUrl));
      onClose();
    } catch (e) {
      setImportError(
        e instanceof Error ? e.message : "Couldn’t use that image.",
      );
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a poster"
        onClick={(e) => e.stopPropagation()}
        className="ev-panel flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon name="close" size={20} />
          </button>

          <label className={chipSkin(false, "cursor-pointer")}>
            <Icon name="upload" size={16} />
            Upload your own

            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </label>
        </div>

        <div className="overflow-y-auto">
          <div className="flex gap-2 px-4 pb-3">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search illustrations (birthday, music, food…)"
              className="min-w-0 flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={runSearch}
              className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-2 px-4 pb-4">
            {cats.map((c) => (
              <Chip
                key={c}
                selected={c === cat}
                onClick={() => pickChip(c)}
              >
                {c}
              </Chip>
            ))}
          </div>

          <div className="px-4 pb-4">
            {message && (
              <p className="mb-3 text-sm text-muted-foreground">
                {message} The designs below still work.
              </p>
            )}

            {/* Loading placeholders for the first search. */}
            {showSkeleton && (
              <div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3"
                aria-busy="true"
                aria-label="Loading illustrations"
              >
                {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-panel bg-muted"
                  />
                ))}
              </div>
            )}

            {/* Pixabay illustrations. */}
            {!showSkeleton && images.length > 0 && (
              <>
                <div
                  className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 ${
                    isPlaceholderData ? "opacity-50" : "opacity-100"
                  }`}
                  aria-busy={isPlaceholderData}
                >
                  {images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      disabled={
                        importingId !== null || isPlaceholderData
                      }
                      onClick={() => void pickIllustration(img)}
                      aria-label={`Use illustration: ${img.alt}`}
                      className="relative aspect-square overflow-hidden rounded-panel bg-muted disabled:opacity-60"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.thumb}
                        alt={img.alt}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover"
                      />

                      {importingId === img.id && (
                        <span className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-semibold text-white">
                          Adding…
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Illustrations from{" "}
                  <a
                    href="https://pixabay.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Pixabay
                  </a>
                </p>
              </>
            )}

            {/* Your own designs remain available as a fallback. */}
            {list.length > 0 && (
              <>
                <p className="mb-2 mt-6 text-sm font-semibold">
                  Our designs
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {list.map((p) => (
                    <div key={p.id}>
                      <button
                        type="button"
                        aria-label={p.name}
                        data-on={!draft.image && draft.posterId === p.id}
                        onClick={() => {
                          update("posterId", p.id);
                          update("image", "");
                          onClose();
                        }}
                        className="ev-sel block w-full overflow-hidden rounded-panel"
                      >
                        <Poster
                          poster={p}
                          title={draft.title || "Your event"}
                          when={whenOf(draft) || "Sat, Oct 17"}
                          where={whereOf(draft) || "Venue"}
                          fontClass={font.className}
                          small
                        />
                      </button>

                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {p.name}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
