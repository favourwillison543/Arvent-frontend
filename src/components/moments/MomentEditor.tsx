"use client";

import { ArrowLeft, Check, Eye, LayoutTemplate, Sparkles, Type } from "lucide-react";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeShell from "@/components/create-event/ThemeShell";
import DesignerArtwork from "@/components/create-event/DesignerArtwork";
import { defaultDraft } from "@/components/create-event/draft";
import { effects } from "@/components/create-event/effects";
import { fonts, themeStyle, themes } from "@/components/create-event/themes";
import { Avatar } from "@/components/ui/Avatar";
import FieldRow from "@/components/ui/FieldRow";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { ChipButton, OptionCard, RailButton, SwatchButton } from "./MomentControls";
import { ActionRail } from "@/components/ui/ActionRail";
import Button from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

import {
  blankMoment,
  kinds,
  type Moment,
  type MomentKind,
  type MomentStyle,
} from "./data";
import MomentCard from "./MomentCard";
import MomentView from "./MomentView";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useCreateMoment } from "@/hooks/useMoments";
import { describeError } from "@/lib/http/errorMessage";
import { momentFormSchema, type MomentFormValues } from "@/lib/validation/moment";

type Draft = MomentFormValues;
type Panel = "theme" | "font" | "effect" | "card" | null;

const kindIds = Object.keys(kinds) as MomentKind[];
const MOMENT_DRAFT_KEY = "arvent:moment-create-draft";

const cardStyles: { id: MomentStyle; name: string; hint: string }[] = [
  { id: "editorial", name: "Envelope", hint: "A card tucked in an envelope" },
  { id: "photo", name: "Big photo", hint: "Larger, standing straight" },
  { id: "minimal", name: "Flat", hint: "Just the card" },
];

const scrollRow =
  "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** True only after the browser has taken over, so storage reads stay off the server. */
const subscribeToNothing = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/*
  There is no form here: you type straight onto the page, and the page
  itself (theme, font, effect) changes as you pick from the side rail.
*/
export default function MomentEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const start = params.get("kind");

  const initialKind = start && start in kinds ? (start as MomentKind) : "save-the-date";
  const { control, register, reset, setValue, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<Draft>({
    resolver: zodResolver(momentFormSchema),
    defaultValues: blankMoment(initialKind),
  });
  const m = useWatch({ control }) as Draft;
  const error = errors.root?.server?.message;
  const [panel, setPanel] = useState<Panel>(null);
  const isHydrated = useIsHydrated();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { events } = useEvents();
  const { isAuthenticated } = useAuth();
  const { createMoment, isCreating } = useCreateMoment();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(MOMENT_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Draft>;
        if (parsed.kind && parsed.kind in kinds) {
          reset({ ...blankMoment(parsed.kind), ...parsed } as Draft);
        }
      }
    } catch {}

    // The restored draft lands in the form; the persist effect below only
    // starts writing once hydration has flipped `isHydrated` to true.
  }, [reset]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(MOMENT_DRAFT_KEY, JSON.stringify(m));
    } catch {
      try {
        sessionStorage.setItem(MOMENT_DRAFT_KEY, JSON.stringify({ ...m, photo: "" }));
      } catch {}
    }
  }, [isHydrated, m]);

  useEffect(() => {
    if (!panel) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setValue(key, value as never, { shouldDirty: true, shouldTouch: true });

  const meta = kinds[m.kind];
  const font = fonts.find((f) => f.id === m.fontId) ?? fonts[0];
  const theme = themes.find((t) => t.id === m.themeId) ?? themes[0];
  const card: Moment = { ...m, id: "preview", createdAt: "" };
  const event = events.find((item) => item.id === m.eventId);

  const onPhoto = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => set("photo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const done = handleSubmit(async (values) => {
    clearErrors("root.server");
    try {
      // `values` is exactly `CreateMomentInput`: the schema carries no field the
      // DTO does not declare, and `useCreateMoment` uploads the photo first.
      const moment = await createMoment(values);
      try {
        sessionStorage.removeItem(MOMENT_DRAFT_KEY);
      } catch {}
      router.push(`/m/${moment.id}`);
    } catch (cause) {
      setError("root.server", {
        message: describeError(
          cause,
          "We couldn’t save this Moment. Please try again.",
        ),
      });
    }
  }, () => {
      setIsPreviewing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));

  if (!isHydrated) return <LoadingScreen />;

  if (isPreviewing) {
    return (
      <MomentView
        moment={card}
        inviteHref={m.kind === "save-the-date" && event ? `/e/${event.slug}` : undefined}
      >
        <div className="flex flex-wrap justify-center gap-3">
          {error && <p role="alert" className="w-full text-sm text-destructive">{error}</p>}
          <Button type="button" variant="outline" onClick={() => setIsPreviewing(false)}>
            Back to editing
          </Button>
          <Button type="button" onClick={done} disabled={isCreating}>
            {isCreating ? "Creating…" : "Create Moment"}
          </Button>
        </div>
      </MomentView>
    );
  }

  return (
    <ThemeShell draft={{ ...defaultDraft, themeId: m.themeId, effectId: m.effectId }}>
      <main className="px-4 pb-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+9rem)] pt-8 sm:pt-12 lg:pb-24 lg:pr-28">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <div className="flex items-center justify-between">
            <Link
              href="/moments"
              className="ev-muted inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[color:var(--ink)]"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Moments
            </Link>
            <span className="ev-faint text-xs">{meta.label}</span>
          </div>

          <div className={scrollRow} role="group" aria-label="Type of Moment">
            {kindIds.map((k) => (
              <ChipButton
                key={k}
                on={m.kind === k}
                onClick={() => reset({ ...blankMoment(k), photo: m.photo, themeId: m.themeId, fontId: m.fontId, effectId: m.effectId, style: m.style })}
              >
                {kinds[k].label}
              </ChipButton>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <span className="ev-muted text-sm">From</span>
            <Avatar name={m.from || "You"} size={28} />
            <Input
              variant="bare"
              aria-label="Your name"
              {...register("from")}
              maxLength={40}
              placeholder="Your name"
              wrapperClassName="w-40"
              className="font-semibold"
            />
          </div>

          <div className="py-3">
            <MomentCard moment={card}>
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                {m.photo && (
                  <button
                    type="button"
                    onClick={() => set("photo", "")}
                    className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-poster-ink"
                  >
                    Remove
                  </button>
                )}
                <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-poster-ink">
                  {m.photo ? "Change image" : "Add image"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
                </label>
              </div>
            </MomentCard>

            {!isAuthenticated && m.photo && (
              <p className="mt-2 text-center text-2xs leading-snug text-destructive-ink">
                An image is saved through your account. Sign in before pressing
                Done - or remove it to post the card without one.
              </p>
            )}
          </div>

          <div>
            <div className="ev-card focus-within:border-[color:var(--ink)]">
              <input
                aria-label="Title"
              {...register("title")}
              maxLength={60}
                placeholder={meta.titlePlaceholder}
                className={`ev-input w-full px-4 py-3 text-center text-3xl ${font.className}`}
              />
            </div>
            {(errors.title?.message || error) && (
              <p role="alert" className="mt-1.5 text-center text-xs text-destructive-ink">
                {errors.title?.message || error}
              </p>
            )}
          </div>

          <FieldRow top>
            <Textarea
              variant="bare"
              aria-label="Note"
              rows={4}
              {...register("message")}
              placeholder={meta.messagePlaceholder}
              className="text-center"
            />
          </FieldRow>

          <div className="grid grid-cols-2 gap-2">
            <FieldRow icon="calendar">
              <Input
                variant="bare"
                aria-label="Date"
                type="date"
                {...register("date")}
              />
            </FieldRow>
            <FieldRow icon="pin">
              <Input
                variant="bare"
                aria-label="Place"
                {...register("place")}
                placeholder="Add a place"
              />
            </FieldRow>
          </div>

          {/* The contract has no per-card visibility: a Moment is readable by
              anyone holding its link. Saying so is better than a switch that
              cannot be saved. */}
          <p className="ev-faint text-center text-2xs leading-relaxed">
            Anyone with the link can open this card.
          </p>

          {meta.link && (
            <FieldRow icon="calendar">
              <Select
                variant="bare"
                aria-label="Linked event"
                value={m.eventId ?? ""}
                onChange={(event) => set("eventId", event.target.value)}
              >
                <option value="">
                  {meta.link === "invitation"
                    ? "Link your event invitation (optional)"
                    : "Link an event to show how many came"}
                </option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </Select>
            </FieldRow>
          )}
        </div>
      </main>

      {/* Tool panels */}
      {panel && <div className="fixed  inset-0 z-30" aria-hidden onClick={() => setPanel(null)} />}

      {panel && (
        <div
          role="dialog"
          aria-label={panel}
          className="ev-panel fixed inset-x-3 bottom-24 z-40 max-h-[60vh] overflow-y-auto p-5 lg:inset-x-auto lg:bottom-auto lg:right-28 lg:top-24 lg:max-h-[75vh] lg:w-88"
        >
          {panel === "theme" && (
            <>
              <h3 className="font-display text-lg font-bold">Theme</h3>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {themes.map((t) => (
                  <SwatchButton
                    key={t.id}
                    label={t.name}
                    on={m.themeId === t.id}
                    onClick={() => set("themeId", t.id)}
                    style={{ ...themeStyle(t), borderColor: "var(--line)" }}
                  />
                ))}
              </div>
            </>
          )}

          {panel === "font" && (
            <>
              <h3 className="font-display text-lg font-bold">Font</h3>
              <div className="mt-4 grid gap-2">
                {fonts.map((f) => (
                  <OptionCard
                    key={f.id}
                    on={m.fontId === f.id}
                    onClick={() => set("fontId", f.id)}
                    className={`text-xl ${f.className}`}
                  >
                    {f.name}
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {panel === "effect" && (
            <>
              <h3 className="font-display text-lg font-bold">Effect</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {effects.map((e) => (
                  <OptionCard
                    key={e.id}
                    on={m.effectId === e.id}
                    onClick={() => set("effectId", e.id)}
                    className="ev-sel flex flex-col items-center justify-center gap-2 py-4 text-center text-xs font-semibold"
                  >
                    {e.motion ? (
                      <span className="block size-7">
                        <DesignerArtwork name={e.icon} className="size-full" />
                      </span>
                    ) : (
                      <span className="block h-7" />
                    )}
                    {e.name}
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {panel === "card" && (
            <>
              <h3 className="font-display text-lg font-bold">Card</h3>
              <div className="mt-4 grid gap-2">
                {cardStyles.map((s) => (
                  <OptionCard
                    key={s.id}
                    on={m.style === s.id}
                    onClick={() => set("style", s.id)}
                  >
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="ev-muted text-xs">{s.hint}</p>
                  </OptionCard>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Side rail on desktop, bottom bar on phones */}
      <ActionRail label="Moment tools">
        <RailButton
          label="Theme"
          on={panel === "theme"}
          onClick={() => toggle("theme")}
          icon={<span className="size-[1.4rem] rounded-full border" style={{ ...themeStyle(theme), borderColor: "var(--line)" }} />}
        />

        <RailButton
          label="Font"
          on={panel === "font"}
          onClick={() => toggle("font")}
          icon={<Type className="size-4" aria-hidden />}
        />

        <RailButton label="Effect" on={panel === "effect"} onClick={() => toggle("effect")} icon={<Sparkles className="size-4" aria-hidden />} />

        <RailButton label="Card" on={panel === "card"} onClick={() => toggle("card")} icon={<LayoutTemplate className="size-4" aria-hidden />} />

        <RailButton label="Preview" onClick={() => setIsPreviewing(true)} icon={<Eye className="size-4" aria-hidden />} />

        <RailButton label="Done" onClick={() => void done()} disabled={isCreating} icon={<span className="grid size-[1.4rem] place-items-center rounded-full bg-foreground text-background"><Check className="size-3.5" strokeWidth={3} aria-hidden /></span>} />
      </ActionRail>
    </ThemeShell>
  );
}
