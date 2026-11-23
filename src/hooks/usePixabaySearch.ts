import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type PixabayImage = {
  id: string;
  alt: string;
  thumb: string;
  full: string;
};

async function searchPixabay(q: string): Promise<PixabayImage[]> {
  const res = await fetch(`/api/pixabay?q=${encodeURIComponent(q)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Search failed.");
  return data.images ?? [];
}

export function usePixabaySearch(q: string, enabled = true) {
  return useQuery({
    queryKey: ["pixabay", q],
    queryFn: () => searchPixabay(q),
    enabled: enabled && q.trim().length > 0,
    staleTime: 24 * 60 * 60 * 1000, // Pixabay asks for 24h caching
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: keepPreviousData, // keep old results while a new chip loads
  });
}