import Select from "@/components/ui/Select";
import { Toggle } from "./controls";
import type { EventDraft, Update } from "./draft";

const storageOptions = [
  { bytes: 256 * 1024 * 1024, label: "256 MB" },
  { bytes: 1024 * 1024 * 1024, label: "1 GB" },
  { bytes: 2 * 1024 * 1024 * 1024, label: "2 GB" },
  { bytes: 5 * 1024 * 1024 * 1024, label: "5 GB" },
];

export default function MemoriesSettings({
  draft,
  update,
}: {
  draft: EventDraft;
  update: Update;
}) {
  return (
    <section
      className="border-t border-border pt-5"
      aria-labelledby="memories-settings-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="memories-settings-title" className="text-sm font-semibold">
            Event memories
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            One shared album for guests to revisit and contribute photos.
          </p>
        </div>
      </div>

      <Toggle
        label="Allow guests to contribute photos"
        checked={Boolean(draft.memoriesEnabled)}
        onChange={(v) => update("memoriesEnabled", v)}
      />

      {draft.memoriesEnabled ? (
        <div className="mt-4 space-y-3">
          <Select
            label="Who can open the gallery?"
            value={draft.memoriesAccess}
            onChange={(event) =>
              update(
                "memoriesAccess",
                event.target.value as EventDraft["memoriesAccess"],
              )
            }
          >
            <option value="invitees">Anyone with the event link</option>
            <option value="public">Anyone with the gallery link</option>
          </Select>

          <Select
            label="Shared photo storage"
            value={draft.memoriesStorageLimitBytes}
            onChange={(event) =>
              update("memoriesStorageLimitBytes", Number(event.target.value))
            }
          >
            {storageOptions.map((option) => (
              <option key={option.bytes} value={option.bytes}>
                {option.label} per event
              </option>
            ))}
          </Select>

          <Select
            label="Total photo slots for this event"
            value={draft.memoriesPhotoLimit}
            onChange={(event) =>
              update("memoriesPhotoLimit", Number(event.target.value))
            }
          >
            {[20, 50, 100].map((limit) => (
              <option key={limit} value={limit}>
                {limit} photos shared by all guests
              </option>
            ))}
          </Select>

          <Select
            label="Photos each guest can add"
            value={draft.memoriesPhotosPerGuest}
            onChange={(event) =>
              update(
                "memoriesPhotosPerGuest",
                Number(event.target.value) as 1 | 2,
              )
            }
          >
            <option value={1}>1 photo per guest</option>
            <option value={2}>2 photos per guest</option>
          </Select>

          <p className="text-2xs leading-relaxed text-muted-foreground">
            The photo slots are shared across guests. Max 20 MB per photo.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Guests won’t be able to contribute photos.
        </p>
      )}
    </section>
  );
}

