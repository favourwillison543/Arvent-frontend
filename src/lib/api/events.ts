import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CancelEventInput,
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "@/lib/types/event";
import { asPage } from "@/lib/utils/list";

/**
 * `GET /events` is cursor-paginated: the body is `{ items, nextCursor }`, not an
 * array. Reading the envelope here means every caller gets a `Page<Event>` and
 * cannot mistake an unwrapped envelope for "you have no events".
 */
export async function getEvents() {
  return asPage<Event>(
    await http.get<unknown>(endpoints.events.list),
    `GET ${endpoints.events.list}`,
  );
}


export function getEvent(id: string) {
  return http.get<Event>(endpoints.events.detail(id));
}

export function createEvent(data: CreateEventInput) {
  return http.post<Event>(endpoints.events.list, data);
}

/**
 * The id an event-shaped response carries, or `undefined`.
 *
 * The contract documents no response schema for the write paths — only that they
 * answer 201/200 — so the id is read from the two shapes an endpoint of this kind
 * uses: the entity itself, or a `{ event: { … } }` wrapper. Callers turn
 * `undefined` into a diagnosable failure instead of routing to `/events/undefined`.
 */
export function readEventId(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;

  const record = body as Record<string, unknown>;
  const wrapped = record.event;

  const candidates = [
    record.id,
    wrapped && typeof wrapped === "object"
      ? (wrapped as Record<string, unknown>).id
      : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate) return candidate;
  }

  return undefined;
}

export function updateEvent(id: string, data: UpdateEventInput) {
  return http.patch<Event>(endpoints.events.detail(id), data);
}

export function deleteEvent(id: string) {
  return http.delete<void>(endpoints.events.detail(id));
}

/**
 * Publishing is a route of its own: `PATCH /events/{id}/publish`, with no body.
 * The API creates every event as a draft, so this is the second call of the
 * create flow (PRD §4.3) — never a `status` field on the create body.
 */
export function publishEvent(id: string) {
  return http.patch<Event>(endpoints.events.publish(id));
}

/** `PATCH /events/{id}/cancel` — terminal for guest-facing intent. */
export function cancelEvent(id: string, data: CancelEventInput = {}) {
  return http.patch<Event>(endpoints.events.cancel(id), data);
}
export function duplicateEvent(id: string) {
  return http.post<Event>(endpoints.events.duplicate(id));
}
