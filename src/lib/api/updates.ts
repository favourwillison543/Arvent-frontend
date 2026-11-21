import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CreateEventUpdateInput,
  EventUpdate,
  UpdateEventUpdateInput,
} from "@/lib/types/update";
import { asPage } from "@/lib/utils/list";

export async function getUpdates(eventId: string) {
  return asPage<EventUpdate>(
    await http.get<unknown>(endpoints.events.updates(eventId)),
    `GET ${endpoints.events.updates(eventId)}`,
  );
}

export function createUpdate(
  eventId: string,
  data: CreateEventUpdateInput,
) {
  return http.post<EventUpdate>(
    endpoints.events.updates(eventId),
    data,
  );
}

export function updateUpdate(
  eventId: string,
  updateId: string,
  data: UpdateEventUpdateInput,
) {
  return http.patch<EventUpdate>(
    endpoints.events.update(eventId, updateId),
    data,
  );
}

export function deleteUpdate(
  eventId: string,
  updateId: string,
) {
  return http.delete<void>(
    endpoints.events.update(eventId, updateId),
  );
}
