import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Serif,
  Plus_Jakarta_Sans,
} from "next/font/google";

import Providers from "./providers";
import { CreateDraftProvider } from "@/components/create-event/CreateDraftProvider";
import { AppToaster } from "@/components/theme/AppToaster";
import { SITE_URL } from "@/lib/site";
import { appearanceInitScript } from "@/lib/theme/appearance";

import "./globals.css";
/* Event theme design system (.ev / .evf). Loaded after globals so the theme
   tokens keep winning ties against base utility styles. */
import "./theme.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Display font (headlines, big numbers, logo wordmark)
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Used only for the single italic accent word in the hero headline
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Relative metadata URLs (canonical links, share images) resolve against this,
  // so a crawler never gets `http://localhost:3000` in a production tag.
  metadataBase: new URL(SITE_URL),
  title: "Arvent",
  description:
    "Create invitations for parties, birthdays, weddings, and gatherings, manage RSVPs, and know who actually shows up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `data-scroll-behavior` mirrors the `scroll-behavior: smooth` that globals.css
  // puts on <html>: it tells the router it may turn the animation off for the
  // length of a navigation, so a new page still arrives at the top instead of
  // gliding there.
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${bricolage.variable} ${instrument.variable} font-sans antialiased`}
      >
        {/* Runs before any app markup is parsed: puts the resolved appearance
            on <html> so the organizer shell never paints the wrong theme. */}
        <script
          id="arvent-appearance"
          dangerouslySetInnerHTML={{ __html: appearanceInitScript }}
        />
        <Providers>
          <CreateDraftProvider>
            {children}
            <AppToaster />
          </CreateDraftProvider>
        </Providers>
      </body>
    </html>
  );
}
