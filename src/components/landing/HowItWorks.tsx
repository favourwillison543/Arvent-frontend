"use client";

import Container from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";

const IMAGES = {
  create: "",
  share: "",
  track: "",
  checkin: "",
};

interface BentoCard {
  title: string;
  body: string;
  image: string;
  span: string;
}

const cards: BentoCard[] = [
  {
    title: "Create your event in minutes",
    body: "Add the name, date, venue and capacity. Choose public or private, and set how many guests each person can bring.",
    image: IMAGES.create,
    span: "md:col-span-7",
  },
  {
    title: "One link is all you need",
    body: "Share it anywhere. Guests open the link, see the details and RSVP in seconds.",
    image: IMAGES.share,
    span: "md:col-span-5",
  },
  {
    title: "Watch the responses come in",
    body: "See who’s confirmed, who hasn’t responded and who can’t make it. Keep track of your capacity as responses come in.",
    image: IMAGES.track,
    span: "md:col-span-5",
  },
  {
    title: "Check guests in at the door",
    body: "Give your door team a link. They find each guest, check people in and you see the count as it happens.",
    image: IMAGES.checkin,
    span: "md:col-span-7",
  },
];

export default function HowItWorks() {
  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.1,
  });

  return (
    <section id="how-it-works" ref={section} className="w-full py-16 sm:py-24">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.05rem)] font-bold leading-[1.02] tracking-[-0.035em]">
            Create, share, track,{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              check in.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Everything your event needs, from the first invite to the moment
            your guests arrive.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          {cards.map((card, index) => {
            const hasImage = Boolean(card.image);

            return (
              <div
                key={card.title}
                className={`group relative flex min-h-60 flex-col justify-between overflow-hidden rounded-panel border p-7 transition duration-500 hover:-translate-y-1 motion-reduce:transition-none sm:p-8 ${
                  hasImage
                    ? "border-transparent text-white"
                    : "border-border bg-muted text-foreground"
                } ${card.span} ${
                  seen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                }`}
                style={{
                  transitionDelay: seen ? `${index * 90}ms` : "0ms",
                }}
              >
                {hasImage && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: `url("${card.image}")`,
                      }}
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"
                    />
                  </>
                )}

                <div className="relative">
                  <h3 className="max-w-md font-display text-2xl font-bold leading-tight tracking-tight">
                    {card.title}
                  </h3>

                  <p
                    className={`mt-3 max-w-md text-sm leading-relaxed sm:text-base ${
                      hasImage ? "text-white/85" : "text-muted-foreground"
                    }`}
                  >
                    {card.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
