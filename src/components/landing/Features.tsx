import Container from "@/components/ui/Container";
import { GateSection } from "./GateSection";
import { ReconfirmationSection } from "./ReconfirmationSection";

export function Features() {
  return (
    <section id="features" className="py-10">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.05rem)] font-bold leading-[1.02] tracking-[-0.035em] text-poster-ink">
            Know the whole{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              story.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            A thoughtful invitation is just the start. Arvent keeps the guest
            list and event day in step, too.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-2">
          <ReconfirmationSection />
          <GateSection />
        </div>
      </Container>
    </section>
  );
}