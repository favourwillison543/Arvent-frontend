import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const allowed = (u: URL) =>
  u.protocol === "https:" &&
  (u.hostname === "pixabay.com" || u.hostname.endsWith(".pixabay.com"));

/* Downloads one Pixabay image and returns it as a data URL. Every hop,
   including redirects, must be a Pixabay host, so this can't be used to
   fetch arbitrary addresses. */
export async function POST(request: Request) {
  const { url } = (await request.json().catch(() => ({}))) as { url?: string };

  let target: URL;
  try {
    target = new URL(String(url));
  } catch {
    return NextResponse.json({ error: "Bad image address." }, { status: 400 });
  }

  let res: Response | null = null;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!allowed(target)) {
      return NextResponse.json({ error: "Image not allowed." }, { status: 400 });
    }

    res = await fetch(target, { redirect: "manual" });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break;
      try {
        target = new URL(location, target);
      } catch {
        return NextResponse.json({ error: "Bad redirect." }, { status: 502 });
      }
      continue;
    }
    break;
  }

  if (!res || !res.ok) {
    return NextResponse.json(
      { error: "Couldn’t download the image." },
      { status: 502 },
    );
  }

  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/")) {
    return NextResponse.json({ error: "Not an image." }, { status: 400 });
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large." }, { status: 413 });
  }

  return NextResponse.json({
    dataUrl: `data:${type};base64,${buf.toString("base64")}`,
  });
}