import { Bell, Check, Link2 } from "lucide-react";

type Props = {
  typeLabel: string;
  copied: boolean;
  onCopy: () => void;
  onRemind: () => void;
};

const action =
  "inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--ring)]";

/**
 * One quiet line: the event type as plain text, then the two actions as text
 * buttons. No chips, no RSVP rule, no Public label.
 */
export default function InvitationActions({
  typeLabel,
  copied,
  onCopy,
  onRemind,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {typeLabel && <span className="ev-muted text-sm">{typeLabel}</span>}

      <button type="button" onClick={onRemind} className={action}>
        <Bell className="size-4" aria-hidden />
        Remind me
      </button>

      <button type="button" onClick={onCopy} className={action}>
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Link2 className="size-4" aria-hidden />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}