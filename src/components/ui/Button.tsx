import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

// Solid pill buttons lift with a hard shadow on hover. Outline and ghost stay flat.
// All variants share a 2px border so every button is the same height.
const lift =
  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift active:translate-x-0 active:translate-y-0 active:shadow-none";

const variants: Record<Variant, string> = {
  // The solid button is ink, not brand: black on a light page, white on a dark
  // one, straight from the theme's own foreground. The brand colour is reserved
  // for accents (a chart, a badge), never for the main action.
  primary: `border-2 border-foreground bg-foreground text-background hover:bg-foreground/90 ${lift}`,
  secondary: `border-2 border-foreground bg-surface text-foreground ${lift}`,
  outline: "border-2 border-border text-foreground hover:bg-muted",
  ghost:
    "border-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  destructive: `border-2 border-foreground bg-destructive text-brand-foreground ${lift}`,
};

// A thumb is 44px. Every size clears that on a phone and only `sm` tightens back
// to 36px from `sm:` up, where the pointer is precise. `lg` is the hero CTA, and
// `icon` is the square case: a single glyph, no label, same 44px box.
const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm sm:h-9",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "size-11 px-0",
};

type Common = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
};

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & Omit<ComponentProps<typeof Link>, "className">;

export type ButtonProps = AsButton | AsLink;

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
  } = props;

  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Renders a Next <Link> when `href` is given, otherwise a <button>.
  if (props.href !== undefined) {
    const {
      variant: _variant,
      size: _size,
      fullWidth: _fullWidth,
      className: _className,
      ...link
    } = props;
    return <Link className={classes} {...link} />;
  }

  const {
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    className: _className,
    type = "button",
    ...button
  } = props;
  return <button type={type} className={classes} {...button} />;
}
