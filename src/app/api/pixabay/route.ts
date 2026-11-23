import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PixabayHit = {
  id: number;
  tags: string;
  webformatURL: string;
  largeImageURL: string;
};

export async function GET(request: Request) {
  const key = process.env.PIXABAY_API_KEY;
  const base = process.env.PIXABAY_API_URL || "https://pixabay.com/api/";

  if (!key) {
    return NextResponse.json(
      { error: "Illustration search isn’t set up." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 100);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  if (!q) {
    return NextResponse.json({ total: 0, images: [] });
  }

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return NextResponse.json(
      { error: "Illustration search isn’t set up." },
      { status: 500 },
    );
  }

  url.searchParams.set("key", key);
  url.searchParams.set("q", q);
  url.searchParams.set("image_type", "illustration");
  url.searchParams.set("orientation", "all");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("per_page", "48");
  url.searchParams.set("page", String(page));

  // Pixabay asks for results to be cached for 24 hours.
  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (!res.ok) {
    return NextResponse.json(
      {
        error:
          res.status === 429
            ? "Too many searches, try again in a minute."
            : "Search failed.",
      },
      { status: res.status === 429 ? 429 : 502 },
    );
  }

  const data = (await res.json()) as { totalHits: number; hits: PixabayHit[] };

  return NextResponse.json({
    total: data.totalHits,
    images: data.hits.map((h) => ({
      id: String(h.id),
      alt: h.tags,
      thumb: h.webformatURL,
      full: h.largeImageURL,
    })),
  });
}