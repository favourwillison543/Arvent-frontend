import Attendance from "./AttendanceSection";
import BrowseEvents from "./BrowseEvents";
import CTA from "./CTA";
import EventTypes from "./EventTypes";
import { Features } from "./Features";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Templates from "./Templates";
import MomentsSection from "@/components/moments/MomentSection";

export function LandingPage() {
  return (
    <>
      <Hero />
      <Templates />
      <BrowseEvents />
      {/* <Attendance /> */}
      <Features />
      <HowItWorks />
      <EventTypes />
      {/* The section, not the wall: a headline, one sentence and a way into the
          editor. It used to render a grid of seed moment cards, which read as
          other people's moments — the API only lists the ones you made, so a
          marketing wall here could only be pretend. Cards removed; the section
          itself is what tells a visitor Moments exist. */}
      <MomentsSection />
      <CTA />
    </>
  );
}
