/**
 * The Chika's 30th invitation card (content only, no outer shell).
 * Wrap it in a white rounded container where you use it.
 * Pass `image` to replace the flat art with a photo.
 */
export default function InviteCard({
  image = "",
  compact = false,
}: {
  image?: string;
  compact?: boolean;
}) {
  return (
    <>
      <div
        className={`relative overflow-hidden rounded-panel bg-foreground ${compact ? "h-44" : "h-56"}`}
        style={
          image
            ? {
                backgroundImage: `url("${image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!image && (
          <>
            <span className="absolute left-[18%] top-[14%] size-9 rounded-full bg-brand" />
            <span className="absolute -right-6 bottom-[-18%] size-36 rounded-full bg-[#ff7ab8]" />
          </>
        )}
        <span className="absolute left-4 top-4 -rotate-6 rounded-field bg-[#ff7ab8] px-2 py-0.5 text-2xs font-extrabold uppercase text-foreground">
          Birthday
        </span>
        <span className="absolute right-4 top-4 rotate-3 rounded-field bg-brand px-2 py-0.5 text-2xs font-extrabold uppercase text-foreground">
          Public
        </span>
        <h3
          className={`absolute bottom-4 left-4 font-display font-extrabold uppercase leading-[0.88] tracking-tight text-white ${
            compact ? "text-4xl" : "text-[2.7rem]"
          }`}
        >
          Chika&apos;s
          <br />
          30th
        </h3>
      </div>

      <div className="relative mt-4 grid gap-3 pr-14 text-sm">
        <div>
          <p className="font-bold">Sat, Oct 10 · The Garden</p>
          <p className="text-xs text-muted-foreground">
            Doors 5:30 PM · Program 6:30 PM
          </p>
        </div>
        <div className="border-l-2 border-brand pl-3 text-xs font-medium text-muted-foreground">
          Opposite the filling station, black gate
        </div>
        <span
          className="absolute bottom-0 right-0 flex size-11 items-center justify-center rounded-full bg-brand text-foreground ring-2 ring-foreground"
          aria-hidden
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
      </div>
    </>
  );
}
