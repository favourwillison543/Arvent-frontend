"use client";

import { ArrowRight } from "lucide-react";

import { useState } from "react";
import Image from "next/image";
import type { EventDraft } from "./draft";

const galleryExamples = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg", "/hero4.jpg", "/hero5.jpg"];

export default function MemoriesInvitationPreview({ draft }: { draft: EventDraft }) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <>
      <section id="guest-memories" className="ev-card scroll-mt-24 p-5 sm:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg font-bold">Memories</p>
              <span className="ev-chip !px-2 !py-0.5 text-2xs">Guest preview</span>
            </div>
            <p className="ev-muted mt-1 text-sm">One shared album for {draft.title || "your event"}.</p>
          </div>
          <span className="ev-chip shrink-0">{draft.memoriesAccess === "public" ? "Anyone with link" : "Anyone with event link"}</span>
        </div>
        {draft.memoriesEnabled ? (
          <>
            <div className="mt-4 grid grid-cols-4 gap-2" aria-hidden="true">
              {galleryExamples.slice(0, 4).map((src) => <Image key={src} src={src} alt="" width={240} height={240} unoptimized className="aspect-square size-full rounded-field object-cover" />)}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="ev-muted text-xs">Guests can add up to {draft.memoriesPhotosPerGuest} {draft.memoriesPhotosPerGuest === 1 ? "photo" : "photos"} each · {draft.memoriesPhotoLimit} total shared slots</p>
              <button type="button" onClick={() => setGalleryOpen(true)} className="ev-chip inline-flex items-center gap-2 !px-4 !py-2.5 !text-sm font-semibold">View all memories <ArrowRight className="size-4" aria-hidden /></button>
            </div>
            <p className="ev-muted mt-2 text-2xs">Guests find this from your invitation and add photos in the shared gallery after publishing.</p>
          </>
        ) : (
          <p className="ev-muted mt-4 rounded-field bg-[color:var(--panel)] p-4 text-sm">Memories are turned off. Guests won’t see the gallery on their invitation.</p>
        )}
      </section>

      {galleryOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="preview-gallery-title" className="fixed inset-0 z-[60] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setGalleryOpen(false); }}>
          <section className="mx-auto mt-5 max-w-4xl rounded-sheet border border-border bg-[var(--panel)] p-5 text-[var(--ink)] shadow-2xl sm:mt-10 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[.16em] opacity-60">Guest gallery preview</p><h2 id="preview-gallery-title" className="mt-1 font-display text-2xl font-bold">{draft.title || "Event"} memories</h2><p className="mt-1 text-sm opacity-70">Everyone adds to the same gallery · {draft.memoriesPhotoLimit} shared photo slots</p></div>
              <button type="button" onClick={() => setGalleryOpen(false)} aria-label="Close gallery preview" className="grid size-10 shrink-0 place-items-center rounded-full border border-current/15 text-xl">×</button>
            </div>
            <div className="mt-6 columns-2 gap-3 sm:columns-3 sm:gap-4">
              {galleryExamples.map((src, index) => <Image key={src} src={src} alt={`Example event memory ${index + 1}`} width={700} height={900} unoptimized className="mb-3 w-full break-inside-avoid rounded-panel object-cover sm:mb-4" />)}
            </div>
            <p className="mt-2 text-center text-xs opacity-65">Example gallery layout. Guest uploads become available after the invitation is published.</p>
          </section>
        </div>
      )}
    </>
  );
}
