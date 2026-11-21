"use client";

import { useEffect, useState } from "react";

import { Poster } from "./Poster";
import { Chip, chipSkin } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { fonts } from "./themes";
import { posters } from "./posters";
import { whenOf, whereOf } from "./format";
import type { EventDraft, Update } from "./draft";

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

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const cats = ["All", ...Array.from(new Set(posters.map((p) => p.category)))];
  const list = posters.filter((p) => cat === "All" || p.category === cat);
  const font = fonts.find((f) => f.id === draft.fontId) ?? fonts[0];
  const onUpload = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      update("image", String(reader.result));
      onClose();
    };
    reader.readAsDataURL(file);
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

        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {cats.map((c) => (
            <Chip key={c} selected={c === cat} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-y-auto p-4 pt-1 sm:grid-cols-3">
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
              <p className="mt-1.5 text-xs text-muted-foreground">{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}