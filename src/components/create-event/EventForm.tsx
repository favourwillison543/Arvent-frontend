import type { ReactNode } from "react";

import EventDetails from "./EventDetails";
import type { Errors, EventDraft, Update } from "./draft";
import Button from "@/components/ui/Button";

export default function EventForm({
  draft,
  update,
  errors,
  onSubmit,
  afterTitle,
  beforeSubmit,
  isSubmitting = false,
  submitError,
  isEditing = false,
}: {
  draft: EventDraft;
  update: Update;
  errors: Errors;
  onSubmit: () => void;
  afterTitle?: ReactNode;
  beforeSubmit?: ReactNode;
  isSubmitting?: boolean;
  submitError?: string;
  isEditing?: boolean;
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-8"
    >
      <EventDetails
        draft={draft}
        update={update}
        errors={errors}
        afterTitle={afterTitle}
      />

      {beforeSubmit}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? isEditing
            ? "Saving changes…"
            : "Creating event…"
          : isEditing
            ? "Save changes"
            : "Create event"}
      </Button>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}
    </form>
  );
}