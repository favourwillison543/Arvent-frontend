"use client";

import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EVENT_BODY, EVENT_TOP } from "@/components/ui/Container";
import EventForm from "./EventForm";
import EventPreview, { POSTER_FRAME } from "./EventPreview";
import EventSettings from "./EventSettings";
import StyleRail from "./StyleRail";
import PosterPicker from "./PostPicker";
import ThemeShell from "./ThemeShell";
import { Icon } from "@/components/ui/Icon";
import { defaultDraft, type Errors, type Update } from "./draft";
import { eventToDraft } from "./eventToDraft";
import { useCreateDraft } from "./CreateDraftProvider";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  useCreateDraftEvent,
  toCreateEventInput,
  resolveImageUrl,
} from "@/hooks/useCreateDraftEvent";
import { useEvent } from "@/hooks/useEvent";
import { describeError } from "@/lib/http/errorMessage";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const templatePresets: Record<
  string,
  { themeId: string; posterId: string; title: string }
> = {
  chika: {
    themeId: "template-chika",
    posterId: "template-chika-poster",
    title: "Chika's 30th",
  },
  owambe: {
    themeId: "template-owambe",
    posterId: "template-owambe-poster",
    title: "Owambe Nights",
  },
  brunch: {
    themeId: "template-brunch",
    posterId: "template-brunch-poster",
    title: "Sunday Brunch",
  },
  era: {
    themeId: "template-era",
    posterId: "template-era-poster",
    title: "End of an era",
  },
  sundown: {
    themeId: "template-sundown",
    posterId: "template-sundown-poster",
    title: "Rooftop Sundown",
  },
};

function CreateEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    draft,
    setDraft,
    setHasDraft,
    editingId,
    setEditingId,
    isDraftHydrated,
    clearDraft,
  } = useCreateDraft();

  const [errors, setErrors] = useState<Errors>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isTemplateReady, setIsTemplateReady] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { createAndPublish, isCreating } = useCreateDraftEvent();

  const submitStarted = useRef(false);

  /* The poster is mounted once, on the side of `lg` that is actually on screen.
     Its drawings address their gradients and filters by id (`url(#evp-b2)`,
     `#evp-grain`), and those ids repeat in every copy — a browser resolves each
     `url(#id)` to the *first* match in the document. A second copy that CSS
     only hid would therefore win the lookup from inside a `display:none`
     subtree and paint the filtered layers (bokeh, glow, shadow, the cake's
     reflection) as nothing: the create screen showed less art than the same
     poster on the invitation. Mounting one copy keeps the visible poster the
     only owner of its ids. */
  const isWide = useMediaQuery("(min-width: 64rem)", true);

  const editId = searchParams.get("editId");
  const templateId = searchParams.get("template");

  // UPDATE hook: loads the event and exposes the update mutation
  const {
    event,
    isLoading: eventLoading,
    error: eventError,
    updateEvent,
    isUpdating,
  } = useEvent(editId ?? "");

  // Edit mode is ready only once this exact event is loaded into the draft
  const isEditReady = !editId || editingId === editId;
  // A leftover draft from an abandoned edit must not show up on /create
  const isStaleEdit = !editId && !!editingId;

  // Copy the existing event into the draft (once per editId)
  useEffect(() => {
    if (!editId || !isDraftHydrated || isRedirecting) return;
    if (editingId === editId) return; // already loaded (or restored after refresh)
    if (eventLoading || !event) return;

    setDraft(eventToDraft(event));
    setHasDraft(true);
    setEditingId(editId);
  }, [
    editId,
    editingId,
    isDraftHydrated,
    isRedirecting,
    eventLoading,
    event,
    setDraft,
    setHasDraft,
    setEditingId,
  ]);

  // A template picked on the landing page owns the draft the first time it
  // arrives, and it replaces a draft left by an earlier template — otherwise
  // "pick another template" would silently keep the first one. The param is
  // then dropped from the URL so a refresh can never overwrite edits.
  const appliedTemplate = useRef<string | null>(null);

  // Create mode: drop stale edit drafts, then apply an optional template
  useEffect(() => {
    if (!isDraftHydrated) return;

    const preset = templateId ? templatePresets[templateId] : undefined;

    startTransition(() => {
      // Editing an existing event: the API copy wins, templates are ignored.
      if (editId) {
        setIsTemplateReady(true);
        return;
      }

      if (preset) {
        if (appliedTemplate.current !== templateId) {
          appliedTemplate.current = templateId;

          clearDraft();
          setDraft({
            ...defaultDraft,
            title: preset.title,
            themeId: preset.themeId,
            posterId: preset.posterId,
            image: "",
          });
          setHasDraft(true);

          const params = new URLSearchParams(searchParams.toString());
          params.delete("template");
          const query = params.toString();

          router.replace(query ? `/create?${query}` : "/create", {
            scroll: false,
          });
        }

        setIsTemplateReady(true);
        return;
      }

      if (editingId) {
        clearDraft();
        return;
      }

      setIsTemplateReady(true);
    });
  }, [
    isDraftHydrated,
    editId,
    editingId,
    templateId,
    searchParams,
    router,
    clearDraft,
    setDraft,
    setHasDraft,
  ]);

  const update: Update = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setHasDraft(true);
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /**
   * The same rules the deployed `CreateEventDto` enforces, answered before the
   * round trip:
   *
   *   name      1–140 (required)
   *   date      required
   *   venueName 1–200 (required - it also becomes `location` when no street
   *             address is given, and `location` is 1–500)
   *   description  ≤5,000, and required by the product: the invitation always
   *             says something about the event
   *   capacity  1–100,000 when set
   *
   * A 400 from the API is the fallback, never the first answer.
   */
  const validate = useCallback((): boolean => {
    const found: Errors = {};

    const title = draft.title.trim();
    const description = draft.description.trim();
    const venue = draft.venue.trim();
    const location = draft.address.trim() || venue;
    const capacity = draft.capacity.trim();

    if (!title) found.title = "Give your event a name.";
    else if (title.length > 140) found.title = "Keep the name under 140 characters.";

    if (!draft.date) found.date = "Pick a date.";

    if (!venue) found.venue = "Add a venue or a location.";
    else if (venue.length > 200) found.venue = "Keep the venue under 200 characters.";
    else if (location.length > 500)
      found.venue = "That address is too long - keep it under 500 characters.";

    if (!description) found.description = "Add a short description for your guests.";
    else if (description.length > 5000)
      found.description = "Keep the description under 5,000 characters.";

    if (capacity) {
      const seats = Number(capacity);

      if (!Number.isInteger(seats) || seats < 1 || seats > 100_000)
        found.capacity = "Spots must be a whole number between 1 and 100,000.";
    }

    setErrors(found);

    if (Object.keys(found).length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    return true;
  }, [
    draft.title,
    draft.date,
    draft.venue,
    draft.address,
    draft.description,
    draft.capacity,
  ]);

  const handlePreview = () => {
    if (!validate()) return;
    setHasDraft(true);
    router.push("/create/preview");
  };

  const handleCreate = useCallback(async () => {
    if (!validate()) return;
    if (!isDraftHydrated || authLoading || isCreating || isRedirecting) return;
    if (submitStarted.current) return;

    if (!isAuthenticated) {
      router.push(
        `/login?returnTo=${encodeURIComponent("/create?createNow=1")}`,
      );
      return;
    }

    setCreateError("");
    submitStarted.current = true;

    try {
      // `createAndPublish` throws unless the API handed back an id, and the id it
      // returns is the one from the *create* answer — the publish answer
      // documents no body at all.
      const created = await createAndPublish(draft);

      // The dashboard opens in a moment; the toast says what just happened, so
      // the redirect does not have to carry the whole message.
      toast.success(`${created.name || draft.title || "Your event"} is live.`);

      // Show the loader first so the empty form never flashes
      setIsRedirecting(true);
      router.push(`/events/${created.id}`);
      clearDraft();
    } catch (cause) {
      console.error("[handleCreate] Create failed", cause);
      setCreateError(
        describeError(cause, "We couldn't create this event. Please try again."),
      );
    } finally {
      submitStarted.current = false;
    }
  }, [
    validate,
    draft,
    isDraftHydrated,
    authLoading,
    isCreating,
    isRedirecting,
    isAuthenticated,
    createAndPublish,
    clearDraft,
    router,
  ]);

  const handleUpdate = useCallback(async () => {
    if (!validate()) return;

    if (!editId) {
      setCreateError("Missing event ID. Cannot update this event.");
      return;
    }

    if (!isDraftHydrated || authLoading || isUpdating || isRedirecting) return;
    if (submitStarted.current) return;

    if (!isAuthenticated) {
      router.push(
        `/login?returnTo=${encodeURIComponent(`/create?editId=${editId}`)}`,
      );
      return;
    }

    setCreateError("");
    submitStarted.current = true;

    try {
      const imageUrl = await resolveImageUrl(draft.image);
      await updateEvent(toCreateEventInput(draft, imageUrl));

      toast.success("Changes saved.");

      setIsRedirecting(true);
      router.push(`/events/${editId}`);
      clearDraft();
    } catch (cause) {
      console.error("[handleUpdate] Update failed", cause);
      setCreateError(
        describeError(cause, "We couldn't update this event. Please try again."),
      );
    } finally {
      submitStarted.current = false;
    }
  }, [
    validate,
    editId,
    draft,
    isDraftHydrated,
    authLoading,
    isUpdating,
    isRedirecting,
    isAuthenticated,
    updateEvent,
    clearDraft,
    router,
  ]);

  // Auto-create after returning from login with ?createNow=1
  useEffect(() => {
    if (
      !isDraftHydrated ||
      searchParams.get("createNow") !== "1" ||
      authLoading ||
      !isAuthenticated ||
      isCreating ||
      isRedirecting
    ) {
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    startTransition(() => void handleCreate());
  }, [
    authLoading,
    handleCreate,
    isAuthenticated,
    isCreating,
    isRedirecting,
    isDraftHydrated,
    searchParams,
  ]);

  /* The wrapper is the poster's own frame, so the Edit pill lands on the poster
     corner at every viewport instead of on a box that only sometimes matches it
     (the poster gives up width on a short screen; `max-w-sm` did not). */
  const poster = (
    <div className={`relative ${POSTER_FRAME}`}>
      <EventPreview draft={draft} />

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="absolute bottom-3 right-3 flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-poster-ink shadow-lg transition hover:scale-105"
      >
        <Icon name="edit" size={16} />
        Edit
      </button>
    </div>
  );

  if (editId && eventError) {
    return (
      <div className={`${EVENT_TOP} ${EVENT_BODY}`}>
        <p className="py-24 text-center text-sm">
          We couldn&apos;t load this event.{" "}
          <button className="underline" onClick={() => router.back()}>
            Go back
          </button>
        </p>
      </div>
    );
  }

  if (
    !isDraftHydrated ||
    !isTemplateReady ||
    !isEditReady ||
    isStaleEdit ||
    isRedirecting
  ) {
    return <LoadingScreen />;
  }

  return (
    <ThemeShell draft={draft}>
      {/* The event column, the same one the invitation and the dashboard hero
          use: the title starts on the same x on all three surfaces. The right
          pad is the rail's clearance (124px + a gutter), so nothing ever runs
          under the tools. */}
      {/* The action rail floats over the bottom of a phone screen, so the form
          has to reserve its height as well as the tab bar's — otherwise the
          one button that finishes the job sits underneath it. `7rem` is the
          rail's own height plus its gap. */}
      <main className={`${EVENT_TOP} pb-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+9rem)] lg:pb-24`}>
        <div className={`${EVENT_BODY} lg:pr-32`}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8">
            {/* Form. On phones the poster sits right under the title. The
                `max-w` is the form's own measure: a field is a reading line, and
                at 20+ inches wide a 700px input is a runway, not a form. */}
            <div className="min-w-0 lg:col-span-6 lg:max-w-[34rem]">
              <EventForm
                draft={draft}
                update={update}
                errors={errors}
                isEditing={Boolean(editId)}
                onSubmit={() => {
                  if (editId) {
                    void handleUpdate();
                    return;
                  }
                  void handleCreate();
                }}
                isSubmitting={authLoading || isCreating || isUpdating}
                submitError={createError}
                afterTitle={isWide ? undefined : <div className="lg:hidden">{poster}</div>}
                beforeSubmit={
                  <div className="lg:hidden">
                    <EventSettings draft={draft} update={update} />
                  </div>
                }
              />
            </div>

            {/* Desktop: poster on the right, follows you down the form. The
                column is half the grid, the way Partiful's is: the poster is
                centred in it and the settings cards use all of it, so the
                poster reads as the page's object and the cards as its detail. */}
            <div className="hidden min-w-0 lg:col-span-6 lg:block">
              <div className="space-y-4 lg:sticky lg:top-10">
                {isWide ? poster : null}

                <EventSettings draft={draft} update={update} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <StyleRail draft={draft} update={update} onPreview={handlePreview} />

      <PosterPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        draft={draft}
        update={update}
      />
    </ThemeShell>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CreateEventContent />
    </Suspense>
  );
}
