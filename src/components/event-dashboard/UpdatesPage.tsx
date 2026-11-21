"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEventUpdates } from "@/hooks/useEventUpdates";
import type { EventUpdate } from "@/lib/types/update";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { SkeletonRows } from "@/components/ui/Skeleton";
import FormError from "@/components/ui/FormError";
import SectionHeader from "@/components/ui/SectionHeader";
import { EdgeSheet, Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/create-event/controls";
import { describeError } from "@/lib/http/errorMessage";
import { updateSchema, type UpdateValues } from "@/lib/validation/update";

export default function UpdatesPage({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const eventId = String(id);
  const [editing, setEditing] = useState<EventUpdate | null>(null);
  /* The update waiting on a yes. A dialog rather than `window.confirm`, which
     reads as the browser asking and cannot say which update it means. */
  const [pendingDelete, setPendingDelete] = useState<EventUpdate | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const { register, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { title: "", message: "" },
  });
  /* `isImportant` is a switch, not a field with an error of its own, so it lives
     beside the form instead of inside it. */
  const [isImportant, setIsImportant] = useState(false);
  const error = errors.root?.server?.message;
  const updates = useEventUpdates(eventId);
  const { updates: updateList, isLoading, error: loadError, createUpdate, updateUpdate, deleteUpdate, isCreating, isUpdating, isDeleting } = updates;
  const submit = handleSubmit(async (values) => {
    clearErrors("root.server");
    try {
      if (editing) {
        await updateUpdate({
          id: editing.id,
          title: values.title,
          message: values.message,
          isImportant,
        });
        setEditing(null);
      } else {
        await createUpdate({
          title: values.title,
          message: values.message,
          isImportant,
        });
      }
      reset({ title: "", message: "" });
      setIsImportant(false);
    } catch (cause) {
      setError("root.server", { message: cause instanceof Error ? cause.message : "Couldn’t save your update." });
    }
  });
  /* Editing selection is UI state; update content remains form state. */
  const startEdit = (update: EventUpdate) => {
    setEditing(update);
    setIsImportant(update.isImportant);
    reset({ title: update.title, message: update.message });
  };
  const cancelEdit = () => {
    setEditing(null);
    reset({ title: "", message: "" });
    setIsImportant(false);
    clearErrors();
  };
  /* A failed delete re-opens the question with the reason on it, instead of
     leaving the row looking untouched and the host guessing. */
  const removeUpdate = () => {
    if (!pendingDelete) return;
    setDeleteError("");
    deleteUpdate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
      onError: (cause) =>
        setDeleteError(describeError(cause, "We couldn’t delete this update.")),
    });
  };
  const dismissDelete = () => {
    setPendingDelete(null);
    setDeleteError("");
  };
  const close = onClose ?? (() => router.push(`/events/${eventId}`));
  return (
    <EdgeSheet title="Event updates" subtitle="Guest communication" onClose={close}>
      {/* The delete question is a dialog of its own rather than a browser
          `confirm`: it can name the update, and a failed delete comes back with
          the reason still on it. */}
      {pendingDelete && (
        <Modal title="Delete this update?" onClose={dismissDelete}>
          <p className="text-sm leading-6 text-muted-foreground">
            “{pendingDelete.title}” will disappear from the event page and from
            the updates guests can read. This can’t be undone.
          </p>
          {deleteError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={removeUpdate}
            >
              {isDeleting ? "Deleting…" : "Delete update"}
            </Button>
            <Button variant="outline" disabled={isDeleting} onClick={dismissDelete}>
              Keep update
            </Button>
          </div>
        </Modal>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-sheet border border-border bg-surface p-5 sm:p-6">
        <SectionHeader
          title={editing ? "Edit update" : "Share an event update"}
          description="Keep guests in the loop if plans change."
        />
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <Input
            label="Title"
            maxLength={100}
            {...register("title")}
            required
            error={errors.title?.message}
            placeholder="Venue update"
          />
          <Textarea
            label="Message"
            maxLength={3000}
            rows={5}
            {...register("message")}
            required
            error={errors.message?.message}
            placeholder="Share the new details…"
          />
          <FormError message={error} />
          <div className="rounded-field border border-border bg-muted/40 p-4">
            <Toggle
              label="Mark as important"
              hint="Pinned to the top of the event page. This is the update the guest email covers, so use it when plans actually change."
              checked={isImportant}
              onChange={setIsImportant}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Post update"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  cancelEdit();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </section>
      <section>
        <SectionHeader title="Recent updates" />
        {isLoading ? (
          <SkeletonRows count={3} className="mt-4" />
        ) : loadError ? (
          <p role="alert" className="py-6 text-sm text-destructive">
            We couldn’t load updates. Refresh and try again.
          </p>
        ) : updateList.length ? (
          <ul className="mt-4 space-y-3">
            {updateList.map((update) => (
              <li
                key={update.id}
                className="rounded-panel border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{update.title}</h3>
                      {update.isImportant && (
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-2xs font-bold uppercase tracking-wide text-muted-foreground">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                      {update.message}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(update.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(update)}
                      className="text-xs font-semibold underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        setDeleteError("");
                        setPendingDelete(update);
                      }}
                      className="text-xs font-semibold text-destructive underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-panel border border-dashed border-border p-6 text-sm text-muted-foreground">
            No updates yet. Your updates will appear here for guests.
          </p>
        )}
      </section>
      </div>
    </EdgeSheet>
  );
}
