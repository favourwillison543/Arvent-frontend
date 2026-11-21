import Link from "next/link";

import Container from "@/components/ui/Container";

import { SocialGlyph, socials } from "./socialLinks";

const links = [
  { label: "Waitlist", href: "/waitlist" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-border py-8">
      <Container>
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-base font-bold tracking-tight text-foreground transition-opacity hover:opacity-70"
            >
              Arvent
            </Link>

            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            >
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <ul className="flex items-center gap-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Arvent on ${social.label}`}
                    title={social.label}
                    className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground focus-visible:border-foreground focus-visible:text-foreground"
                  >
                    <SocialGlyph>{social.glyph}</SocialGlyph>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
