import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";

/**
 * What `POST /uploads/event-image` answers (v2.2): `{ imageUrl }`.
 *
 * The URL is then sent as `CreateEventInput.imageUrl` — the event takes a URL,
 * not an upload id. The upload is a separate step because the browser's own
 * `data:` URL is not part of the contract.
 */
export type UploadEventImageResponse = {
  imageUrl: string;
};

export async function uploadEventImage(file: File) {
  const formData = new FormData();

  // The field is `image`; `file` and `photo` are accepted too, since the PRD
  // does not name it. Send the documented one.
  formData.append("image", file);

  return http.post<UploadEventImageResponse>(
    endpoints.uploads.eventImage,
    formData,
  );
}

/** `POST /uploads/moment-image` — same field, same answer: `{ imageUrl }`. */
export async function uploadMomentImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return http.post<UploadEventImageResponse>(
    endpoints.uploads.momentImage,
    formData,
  );
}
