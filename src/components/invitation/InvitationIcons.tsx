import { Link2, Lock } from "lucide-react";

/* Shared invitation icons. Thin wrappers so call sites keep their `size` API. */

export function LinkIcon({ size = 18 }: { size?: number }) {
  return <Link2 aria-hidden width={size} height={size} />;
}

export function LockIcon({ size = 18 }: { size?: number }) {
  return <Lock aria-hidden width={size} height={size} />;
}