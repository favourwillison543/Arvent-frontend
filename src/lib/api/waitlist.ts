import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";

export type WaitlistInput = {
  email: string;
  /** Optional, so the team knows which city to open next. */
  city?: string;
};

export type WaitlistEntry = {
  email: string;
  position?: number;
  alreadyOnList?: boolean;
};

/** Public waitlist signup. No account, no token. */
export function joinWaitlist(data: WaitlistInput) {
  return http.post<WaitlistEntry>(endpoints.public.waitlist, data);
}
