"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Monitor, Smartphone } from "lucide-react";

import Button from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import PageHeader from "@/components/ui/PageHeader";
import { READING_BODY } from "@/components/ui/Container";
import { emailPreviews } from "@/lib/email/templates";

/**
 * A design screen for the four guest emails.
 *
 * Each tab renders the real template output — the same HTML a provider would
 * send — inside an iframe, so the preview cannot borrow the app's stylesheet or
 * its fonts. The width switch is the mobile test: 390px is the card at the
 * width of a phone, where the detail rows stack and the button goes full width.
 */
export default function EmailPreviewPage() {
  const previews = useMemo(() => emailPreviews(), []);
  const [activeId, setActiveId] = useState(previews[0].id);
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const [showText, setShowText] = useState(false);
  const [copied, setCopied] = useState(false);

  const active =
    previews.find((preview) => preview.id === activeId) ?? previews[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(active.html);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([active.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `arvent-${active.id}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="pb-16">
      <PageHeader
        width="narrow"
        title="Guest emails"
        description="The confirmation and the three emails that follow it. This is what Gmail and Outlook draw."
      />

      <div className={READING_BODY}>
        <div className="flex flex-wrap items-center gap-2">
          {previews.map((preview) => (
            <Chip
              key={preview.id}
              selected={preview.id === activeId}
              onClick={() => setActiveId(preview.id)}
            >
              {preview.label}
            </Chip>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-panel border border-border bg-surface p-2">
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              selected={width === "desktop"}
              onClick={() => setWidth("desktop")}
              icon={<Monitor aria-hidden className="size-4" />}
            >
              Desktop
            </Chip>
            <Chip
              selected={width === "mobile"}
              onClick={() => setWidth("mobile")}
              icon={<Smartphone aria-hidden className="size-4" />}
            >
              Phone
            </Chip>
            <Chip selected={showText} onClick={() => setShowText((on) => !on)}>
              {showText ? "Show design" : "Plain text"}
            </Chip>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void copy()}>
              {copied ? (
                <Check aria-hidden className="size-3.5" />
              ) : (
                <Copy aria-hidden className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy HTML"}
            </Button>

            <Button variant="ghost" size="sm" onClick={download}>
              <Download aria-hidden className="size-3.5" />
              Download
            </Button>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Subject:</span>{" "}
          {active.subject}
        </p>

        <div className="mt-2 flex justify-center rounded-panel border border-border bg-muted/40 p-3">
          {showText ? (
            <pre
              className={`w-full whitespace-pre-wrap rounded-field bg-background p-4 text-sm leading-relaxed text-foreground ${
                width === "mobile" ? "max-w-[390px]" : ""
              }`}
            >
              {active.text}
            </pre>
          ) : (
            <iframe
              key={`${active.id}-${width}`}
              title={`${active.label} email preview`}
              srcDoc={active.html}
              sandbox=""
              className={`h-[72vh] rounded-field border border-border bg-white transition-[width] duration-200 ${
                width === "mobile" ? "w-full max-w-[390px]" : "w-full"
              }`}
            />
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Preview only. The app has no mail provider configured yet; the templates
          in <code>src/lib/email</code> return{" "}
          <code>{"{ subject, html, text }"}</code>, so sending is one call wherever
          a provider is wired in.
        </p>
      </div>
    </main>
  );
}
