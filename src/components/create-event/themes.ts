/* Event themes: typography presets, background palettes and the shared style helper.
   Keep the ids in sync with the ART / SCENE maps (themeArt.tsx, scenes.tsx).

   Palette rules:
   - Dark themes are deep and tinted (ink, aubergine, forest), never pure black.
   - Light themes are warm and low-glare (oat, clay, sage), never pure white.
   - Every theme is a base tone plus one or two soft glows, so the page has light
     and depth instead of a flat fill. ThemeShell adds grain and a vignette. */

     import type { CSSProperties } from "react";

     export const fonts = [
       { id: "classic", name: "Classic", className: "font-display font-bold" },
       {
         id: "editorial",
         name: "Editorial",
         className: "font-accent italic font-normal",
       },
       { id: "literary", name: "Literary", className: "evf-fraunces" },
       { id: "elegant", name: "Elegant", className: "evf-playfair" },
       { id: "fancy", name: "Fancy", className: "evf-pacifico" },
       { id: "handwritten", name: "Handwritten", className: "evf-caveat" },
       { id: "digital", name: "Digital", className: "evf-orbitron" },
       { id: "condensed", name: "Condensed", className: "evf-bebas" },
       { id: "retro", name: "Retro", className: "evf-shrikhand" },
       { id: "eclectic", name: "Eclectic", className: "evf-bowlby" },
       // Grown-up options: used by traditional ceremonies, conventions and the
       // quieter, more formal invitations.
       { id: "ceremonial", name: "Ceremonial", className: "evf-cinzel" },
       { id: "refined", name: "Refined", className: "evf-cormorant" },
       { id: "heritage", name: "Heritage", className: "evf-marcellus" },
       { id: "bookish", name: "Bookish", className: "evf-baskerville" },
       { id: "corporate", name: "Corporate", className: "evf-archivo" },
       { id: "minimal", name: "Minimal", className: "evf-josefin" },
     ];
     
     /*
       Each theme keeps its pieces separate (color, image layers, size per layer)
       so we never mix the `background` shorthand with longhand properties.
     */
     export type Theme = {
       id: string;
       name: string;
       mode: "dark" | "light";
       color: string;
       image: string;
       size: string;
     };
     
     /* ---------- builders ---------- */
     
     const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
     const a = (h: string, o: number) => `rgba(${rgb(h).join(",")},${o})`;
     
     /** [x%, y%, colour, opacity, radius%] */
     type Glow = [number, number, string, number, number?];
     const glow = ([x, y, h, o, r = 55]: Glow) =>
       `radial-gradient(ellipse at ${x}% ${y}%,${a(h, o)},transparent ${r}%)`;
     
     /** A base tone (top to bottom) with soft glows and an optional texture layer. */
     function tone(
       id: string,
       name: string,
       mode: "dark" | "light",
       top: string,
       bottom: string,
       glows: Glow[] = [],
       texture?: string,
     ): Theme {
       return {
         id,
         name,
         mode,
         color: top,
         image: [...glows.map(glow), texture, `linear-gradient(160deg,${top},${bottom})`].filter(Boolean).join(","),
         size: "auto",
       };
     }
     
     const lines = (rgba: string, gap = 6, deg = 0) =>
       `repeating-linear-gradient(${deg}deg,${rgba} 0 1px,transparent 1px ${gap}px)`;
     
     export const themes: Theme[] = [
       /* ============ Moments ============ */
       tone("moment-save-date", "Moment · Save the date", "light", "#ece3ec", "#ddd0df", [[50, 34, "#a98bc4", 0.28, 58]]),
       tone("moment-announcement", "Moment · Announcement", "light", "#f0dccf", "#e6c9b8", [[50, 38, "#d99a82", 0.3, 48]]),
       tone("moment-milestone", "Moment · Milestone", "light", "#e8cf86", "#cfa650", [[30, 20, "#fff0b8", 0.35, 50]]),
       tone("moment-thank-you", "Moment · Thank you", "light", "#ebe5d8", "#ddd5c4", [[50, 40, "#fff8ea", 0.6, 66]]),
     
       /* ============ Poster-matched ============ */
       tone("poster-editorial", "Editorial", "light", "#e2d4c6", "#d3bfae", [[50, -6, "#fff8ee", 0.5, 60]], lines("rgba(42,38,36,.035)", 5)),
       tone("poster-grand-affair", "Grand Affair", "dark", "#4a0f1e", "#1c040c", [[50, 0, "#d4a94a", 0.26, 52], [50, 100, "#d4a94a", 0.1, 50]]),
       {
         id: "poster-brutalist",
         name: "Brutalist",
         mode: "dark",
         color: "#0d0d0d",
         image:
           "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px),radial-gradient(ellipse at 100% 0%,rgba(255,43,31,.22),transparent 40%),linear-gradient(180deg,#121212,#080808)",
         size: "44px 44px, 44px 44px, auto, auto",
       },
       tone("poster-little-moments", "Little Moments", "light", "#f3d9c6", "#e8c3ab", [[18, 14, "#9ccfe8", 0.4, 50], [86, 90, "#fff4ea", 0.4, 50]]),
       tone("poster-after-hours", "After Hours", "dark", "#1d0b3a", "#0a0614", [[14, 10, "#7a2cff", 0.45, 50], [90, 92, "#ff7a2e", 0.22, 50], [70, 40, "#d61f8c", 0.16, 50]]),
       tone("poster-navy-gold", "Navy & Gold", "dark", "#0f2048", "#050b1f", [[50, -4, "#d4b24a", 0.22, 52]]),
       tone("poster-lavender", "Lavender", "light", "#ddd3ee", "#cbbde3", [[20, 8, "#f6f1fb", 0.5, 52], [88, 92, "#b39ad9", 0.45, 52]]),
       tone("poster-butter", "Butter", "light", "#efe2a6", "#dcc56a", [[50, -6, "#fff8d8", 0.45, 55], [90, 92, "#d6a93a", 0.35, 52]]),
     
       /* ============ Template posters ============ */
       tone("template-chika", "Chika’s 30th", "dark", "#1f1a22", "#0f0c12", [[88, 24, "#ff7ab8", 0.28, 46], [12, 18, "#ff9ac8", 0.1, 38]]),
       tone("template-owambe", "Owambe Nights", "dark", "#241606", "#0e0803", [[20, 18, "#e0a040", 0.3, 46], [82, 88, "#a8400c", 0.28, 52]]),
       tone("template-brunch", "Sunday Brunch", "light", "#f1e3c6", "#e6cfa6", [[82, 14, "#ffd36a", 0.35, 42], [14, 88, "#f0a878", 0.25, 46]]),
       tone("template-era", "End of an era", "dark", "#302b44", "#17141f", [[20, 22, "#b79bff", 0.26, 46], [86, 74, "#ff7ab8", 0.18, 50]]),
       tone("template-sundown", "Rooftop Sundown", "dark", "#4a1c20", "#1c0a10", [[72, 104, "#ff6b4a", 0.5, 55], [80, 16, "#ffb35e", 0.18, 40]]),
       tone("template-oktoberfest", "Oktoberfest", "dark", "#12483c", "#06201a", [[50, 0, "#f6c453", 0.22, 50], [15, 90, "#2f86d6", 0.14, 45]]),
       tone("template-ramen", "Ramen Night", "dark", "#5a1410", "#1a0606", [[50, 30, "#ff7a4a", 0.25, 46], [90, 90, "#ffb347", 0.15, 46]]),
       tone("template-halloween", "Pumpkin Party", "dark", "#22103f", "#0b0516", [[80, 18, "#fff0b0", 0.2, 38], [20, 90, "#ff8a1f", 0.18, 46]]),
       tone("template-beach", "Beach Day", "light", "#ecdcc0", "#dcc29a", [[50, 0, "#8fc4e0", 0.35, 50], [80, 100, "#e8a868", 0.3, 50]]),
       tone("template-pool", "Pool Party", "light", "#cfe6e6", "#b5d5da", [[20, 10, "#f4fbfb", 0.5, 45], [85, 90, "#3aa9c4", 0.3, 50]]),
       tone("template-housewarming", "Housewarming", "dark", "#1f2a4a", "#0e1224", [[50, 60, "#ffcf6a", 0.18, 45], [86, 18, "#fff4d0", 0.12, 30]]),
       tone("template-gathering", "Small Gathering", "dark", "#2a1a0e", "#0e0704", [[48, 50, "#ff9a4a", 0.24, 50]]),
       tone("template-suya", "Suya Night", "dark", "#2a1409", "#0c0502", [[50, 100, "#ff6a1a", 0.4, 55], [20, 10, "#ffb347", 0.1, 40]]),
       tone("template-graduation", "Graduation Day", "dark", "#0f1f45", "#060c1e", [[50, -4, "#d4b24a", 0.22, 52]]),
       tone("template-christmas", "Christmas Party", "dark", "#0f3a2c", "#04150f", [[20, 20, "#c8283a", 0.16, 40], [80, 80, "#ffd23f", 0.14, 45]]),
       tone("template-movie", "Movie Night", "dark", "#121c3c", "#05070f", [[50, 0, "#9ac8ff", 0.2, 50]]),
       tone("template-karaoke", "Karaoke Night", "dark", "#1c0a3e", "#07020f", [[30, 20, "#ff4fa0", 0.28, 45], [80, 70, "#33d6ff", 0.2, 45]]),
       tone("template-sendoff", "Japa Send-off", "dark", "#263a72", "#0e1430", [[50, 60, "#f0a070", 0.32, 50]]),
     
       /* ============ Art themes (the page is drawn in themeArt.tsx) ============
          `color` and `image` only paint the swatch in the picker. */
       tone("art-poolside", "Poolside", "light", "#e1eae4", "#efd8cc", [[18, 10, "#7fb4ad", 0.6, 50], [90, 20, "#e8b98a", 0.5, 40]]),
       tone("art-mulberry", "Mulberry", "dark", "#2a1034", "#12061a", [[18, 10, "#6a2a78", 0.7, 55], [88, 24, "#b8456f", 0.4, 40]]),
       tone("art-dusk", "Dusk", "dark", "#1d2a4a", "#0c101e", [[20, 12, "#3a4a8a", 0.7, 55], [92, 26, "#c8706a", 0.5, 42]]),
       tone("art-oat", "Oat", "light", "#e8e0cf", "#e2d3c0", [[14, 10, "#d9b88a", 0.55, 50], [92, 24, "#a8b5a0", 0.45, 42]]),
       tone("art-sage", "Sage garden", "light", "#ebe7d9", "#e0dac6", [[0, 0, "#8aa38b", 0.55, 30], [100, 100, "#8aa38b", 0.5, 30]]),
       tone("art-blush", "Blush garden", "light", "#eddfd8", "#e4cfc6", [[0, 0, "#a9b49a", 0.5, 30], [100, 100, "#d99aa4", 0.5, 32]]),
       tone("art-terrazzo", "Terrazzo", "light", "#ece3d3", "#e0d4bf", [[20, 25, "#c4694d", 0.35, 12], [70, 20, "#3f8c82", 0.3, 12], [45, 62, "#d9b45c", 0.35, 12], [80, 75, "#2f4650", 0.25, 10]]),
       tone("art-sundown", "Sundown", "dark", "#241230", "#150a1c", [[50, 108, "#f2b47e", 0.7, 60], [50, 108, "#e07a5f", 0.5, 80]]),
       tone("art-clay", "Clay arches", "light", "#e9d8c6", "#dcc2ab", [[50, 108, "#e5b48a", 0.7, 60], [50, 108, "#c9805f", 0.45, 80]]),
       tone("art-deepsea", "Deep sea", "dark", "#0b2036", "#06121f", [[50, 100, "#2a9d9a", 0.45, 60], [50, 80, "#4a8fc0", 0.25, 60]]),
       tone("art-milkyway", "Milky way", "dark", "#0b1228", "#04060f", [[50, 52, "#5a78c8", 0.38, 55], [60, 40, "#9a7ad0", 0.2, 40]]),
       tone("art-tropic", "Tropic night", "dark", "#0e332a", "#071a14", [[0, 0, "#2f8a62", 0.5, 34], [100, 100, "#2f8a62", 0.5, 34]]),
       tone("art-palm-shade", "Palm shade", "light", "#e4e6d2", "#d6d9be", [[0, 0, "#6f9a72", 0.35, 34], [100, 100, "#6f9a72", 0.35, 34]]),
     
       /* ============ Scene themes (animated in scenes.tsx) ============ */
       tone("scene-haunted", "Haunted", "dark", "#17151c", "#0a090d", [[50, 0, "#8a7ab0", 0.14, 50]], "repeating-radial-gradient(circle at 0% 0%,rgba(255,255,255,.2) 0 1px,transparent 1px 9px)"),
       tone("scene-snow", "Snow day", "light", "#e3e6ea", "#d1d6dc", [[70, 28, "#a8c4e6", 0.4, 22], [30, 70, "#d98aa8", 0.25, 18]]),
       tone("scene-fairway", "Fairway", "light", "#b4d49c", "#9cc084", [[30, 20, "#d4e8b8", 0.5, 40]]),
     
       /* ============ Dark ============ */
       tone("midnight", "Midnight", "dark", "#141a2c", "#07090f", [[50, -4, "#3a4a7a", 0.4, 55]]),
       tone("noir", "Noir", "dark", "#18181b", "#08080a", [[50, 0, "#4a4a55", 0.25, 50]], lines("rgba(255,255,255,.03)", 16, 135)),
       tone("aurora", "Aurora", "dark", "#0e1826", "#070a12", [[15, 10, "#4aa08c", 0.35, 55], [90, 20, "#8a6ac0", 0.3, 50]]),
       tone("ember", "Ember", "dark", "#27160a", "#0e0804", [[80, 0, "#d49a3a", 0.32, 55], [10, 100, "#a8400c", 0.2, 50]]),
       tone("forest", "Forest", "dark", "#0f2a20", "#06120d", [[20, 0, "#3a8a62", 0.32, 55]]),
       tone("ocean", "Ocean", "dark", "#0a2236", "#050f1a", [[80, 0, "#2a78b0", 0.35, 55], [10, 30, "#2a9d9a", 0.2, 50]]),
       tone("plum", "Plum", "dark", "#2a1233", "#12081a", [[20, 0, "#9a3aa8", 0.34, 55]]),
       tone("ruby", "Ruby", "dark", "#2e0e12", "#120406", [[85, 0, "#b83038", 0.32, 55]]),
       tone("cobalt", "Cobalt", "dark", "#0d1d4a", "#060c24", [[28, 24, "#2f5fc8", 0.4, 45], [76, 75, "#35a8c0", 0.22, 45]]),
       tone("velvet", "Velvet", "dark", "#25102f", "#0c0818", [[30, 20, "#a83ca8", 0.4, 50], [85, 80, "#4c3098", 0.4, 50]]),
       tone("copper", "Copper", "dark", "#2e1810", "#120a06", [[24, 75, "#d0703a", 0.4, 48]]),
       tone("lagoon", "Lagoon", "dark", "#0a2c33", "#05151a", [[28, 22, "#2aa89c", 0.4, 48], [82, 75, "#2a68a8", 0.35, 45]]),
       tone("night-sky", "Night Sky", "dark", "#0b1228", "#04060f", [[24, 28, "#f1d995", 0.1, 8], [68, 53, "#b8d6ff", 0.1, 8], [50, 50, "#3a4a8a", 0.3, 55]]),
       tone("orchid", "Orchid", "dark", "#2c1440", "#0c0a1e", [[24, 26, "#b83a98", 0.4, 47], [75, 70, "#5a4ac0", 0.4, 50]]),
       tone("ink-wash", "Ink Wash", "dark", "#16181f", "#08090d", [[27, 60, "#424859", 0.5, 49], [79, 24, "#634f7e", 0.3, 43]]),
       tone("graphite", "Graphite", "dark", "#1e1f23", "#0a0b0d", [[50, 0, "#4a4c55", 0.25, 55]], lines("rgba(255,255,255,.035)", 8, 90)),
       tone("traditional-gold", "Traditional Gold", "dark", "#2e141c", "#12080c", [[20, 16, "#d4a64a", 0.32, 46], [82, 84, "#7a1f2c", 0.7, 52]]),
       tone("heritage-emerald", "Heritage Emerald", "dark", "#0d2e20", "#05130c", [[78, 18, "#c6a458", 0.26, 44], [18, 82, "#16543a", 0.8, 55]]),
       tone("convention-slate", "Convention Slate", "dark", "#161e28", "#090d12", [[50, -12, "#5a8ad0", 0.3, 56], [88, 92, "#7e5cff", 0.16, 48]]),
       tone("midnight-velvet", "Midnight Velvet", "dark", "#111d30", "#060910", [[24, 12, "#4860a0", 0.36, 48], [84, 88, "#7e4a78", 0.28, 50]]),
       tone("oxblood", "Oxblood", "dark", "#3a1016", "#140508", [[20, 10, "#b04050", 0.3, 50]]),
       tone("espresso", "Espresso", "dark", "#2a1a10", "#0f0804", [[80, 0, "#a87a4a", 0.26, 55]]),
       tone("petrol", "Petrol", "dark", "#0e3036", "#061418", [[20, 10, "#2a8a8a", 0.3, 55]]),
       tone("olive-night", "Olive night", "dark", "#1f2612", "#0a0e06", [[20, 10, "#8a9a42", 0.24, 55]]),
       tone("indigo", "Indigo", "dark", "#1b1b4a", "#0a0a22", [[80, 0, "#5a5ad0", 0.3, 55]]),
       tone("bronze", "Bronze", "dark", "#3a2610", "#150d05", [[20, 10, "#c4903a", 0.28, 55]]),
       tone("aubergine", "Aubergine", "dark", "#2c1030", "#10061a", [[80, 0, "#8a3a9a", 0.3, 55]]),
       tone("rust", "Rust", "dark", "#3a1a0e", "#150805", [[80, 100, "#c4602a", 0.34, 55]]),
       tone("teal-deep", "Deep teal", "dark", "#0b3a3a", "#041818", [[20, 0, "#2aa8a0", 0.3, 55]]),
       tone("smoke", "Smoke", "dark", "#262628", "#0e0e10", [[50, 0, "#68686e", 0.22, 55]]),
     
       /* ============ Light (warm, low-glare) ============ */
       tone("paper", "Paper", "light", "#e8e1d2", "#ddd4c2", [[50, -4, "#f6f0e2", 0.5, 55]]),
       tone("blush", "Blush", "light", "#ecd8d0", "#e0c4bb", [[10, 0, "#f0b8a8", 0.45, 55], [95, 15, "#ecc890", 0.35, 50]]),
       tone("mist", "Mist", "light", "#e1e5ea", "#d2d8e0", [[50, -4, "#f2f4f8", 0.5, 55]]),
       tone("sunrise", "Sunrise", "light", "#f0dcc6", "#e8c7a8", [[15, 0, "#f0a86a", 0.45, 55], [95, 20, "#e88aa0", 0.3, 50]]),
       tone("sky", "Sky", "light", "#dce6ef", "#c9d8e6", [[20, 8, "#f4f8fb", 0.6, 55], [90, 0, "#78a8e0", 0.4, 55]]),
       tone("mint", "Mint", "light", "#dde8dc", "#c9dbc9", [[10, 0, "#8ac8a0", 0.4, 55], [95, 15, "#d4de7a", 0.28, 50]]),
       {
         id: "grid",
         name: "Grid",
         mode: "light",
         color: "#ebe5d8",
         image:
           "linear-gradient(rgba(60,52,40,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(60,52,40,.07) 1px,transparent 1px),linear-gradient(160deg,#ebe5d8,#ddd5c4)",
         size: "28px 28px, 28px 28px, auto",
       },
       tone("linen", "Linen", "light", "#e8dfd0", "#ddd2bf", [], `${lines("rgba(95,76,51,.07)", 4)},${lines("rgba(95,76,51,.06)", 5, 90)}`),
       tone("marble", "Marble", "light", "#e4e0da", "#d6d1c9", [[30, 40, "#f6f3ee", 0.7, 38]], "repeating-linear-gradient(122deg,transparent 0 22px,rgba(130,116,105,.1) 23px 25px,transparent 27px 40px)"),
       tone("rosewater", "Rosewater", "light", "#ecd2d6", "#e0bcc4", [[25, 25, "#f8e8e4", 0.6, 48], [80, 80, "#d890a8", 0.45, 58]]),
       tone("terracotta", "Terracotta", "light", "#e0b697", "#cf9473", [[22, 74, "#a4442d", 0.45, 20], [78, 25, "#f0c080", 0.5, 24]]),
       tone("sea-glass", "Sea Glass", "light", "#d0e4dc", "#b8d2d4", [[20, 30, "#eef7f3", 0.6, 42], [82, 70, "#5cb5a8", 0.4, 48]]),
       tone("wildflower", "Wildflower", "light", "#ebe0c8", "#d8e2c6", [[25, 25, "#d88aa0", 0.35, 14], [73, 72, "#d4b04a", 0.3, 12], [71, 20, "#9c83bf", 0.3, 10]]),
       tone("aso-oke", "Aso Oke", "light", "#ecdcc2", "#dcc49e", [[24, 22, "#b6552f", 0.4, 17], [78, 76, "#2f4a86", 0.38, 21]], `${lines("rgba(70,44,29,.09)", 9, 90)},${lines("rgba(70,44,29,.07)", 11)}`),
       tone("summit-hall", "Summit Hall", "light", "#e4e9ef", "#d2dae4", [], `${lines("rgba(15,23,42,.045)", 44, 90)},${lines("rgba(15,23,42,.045)", 44)}`),
       tone("expo-hall", "Expo Hall", "light", "#ece4d6", "#ddd2bf", [[50, -8, "#faf5ea", 0.7, 62]]),
       tone("ivory-linen", "Ivory Linen", "light", "#f0ebe0", "#e4dccf", [], `${lines("rgba(120,104,80,.045)", 6, 45)},${lines("rgba(120,104,80,.045)", 6, -45)}`),
       tone("champagne-silk", "Champagne Silk", "light", "#efe0c6", "#e0c9a4", [[28, 18, "#faf0dc", 0.8, 50], [80, 80, "#d6b274", 0.4, 56]]),
       tone("monochrome", "Monochrome", "light", "#e6e6e8", "#d4d4d8", [[50, -4, "#f4f4f6", 0.6, 58]]),
       tone("oat-milk", "Oat milk", "light", "#e9e1d0", "#ddd3be", [[50, 0, "#f4eee0", 0.5, 55]]),
       tone("clay", "Clay", "light", "#e5cfc0", "#d6baa8", [[20, 10, "#f0d8c8", 0.5, 55]]),
       tone("sage-mist", "Sage mist", "light", "#dce3d6", "#c8d3c0", [[20, 8, "#eef3e8", 0.55, 55]]),
       tone("pearl-lilac", "Pearl lilac", "light", "#e3deeb", "#d2cadf", [[20, 8, "#f2eff7", 0.55, 55]]),
       tone("fog", "Fog", "light", "#e0e3e6", "#cfd4d9", [[50, -4, "#eff1f3", 0.55, 55]]),
       tone("buttercream", "Buttercream", "light", "#ece2bf", "#dccf98", [[50, -4, "#f6eed0", 0.5, 55]]),
       tone("dune", "Dune", "light", "#e6d6bb", "#d6c19c", [[80, 0, "#f0dfc0", 0.5, 55]]),
       tone("apricot", "Apricot", "light", "#f0d6bf", "#e6c0a0", [[20, 10, "#f6e0cc", 0.5, 55]]),
       tone("denim-light", "Denim", "light", "#d6dfea", "#c0cee0", [[20, 8, "#e8eef6", 0.55, 55]]),
       tone("olive-light", "Olive", "light", "#dfe0c6", "#cdd0a8", [[20, 8, "#eef0d8", 0.5, 55]]),
       tone("mustard", "Mustard", "light", "#e6cd7a", "#d2b050", [[30, 10, "#f2e0a0", 0.5, 55]]),
     ];
     
     /** Longhand background styles for a theme (use `fixed` for the page itself). */
     export function themeStyle(theme: Theme, fixed = false): CSSProperties {
       return {
         backgroundColor: theme.color,
         backgroundImage: theme.image,
         backgroundSize: theme.size,
         ...(fixed ? { backgroundAttachment: "fixed" } : {}),
       };
     }
     
     /* ------------------------------------------------------------------ */
     /* Poster pairing: when a poster is picked, its page theme and a quiet  */
     /* effect come with it, so the invitation reads as one designed piece.  */
     /* ------------------------------------------------------------------ */
     
     export const POSTER_THEME: Record<string, string> = {
       "template-chika-poster": "template-chika",
       "template-owambe-poster": "template-owambe",
       "template-brunch-poster": "template-brunch",
       "template-era-poster": "template-era",
       "template-sundown-poster": "template-sundown",
       "template-oktoberfest-poster": "template-oktoberfest",
       "template-ramen-poster": "template-ramen",
       "template-halloween-poster": "template-halloween",
       "template-beach-poster": "template-beach",
       "template-pool-poster": "template-pool",
       "template-housewarming-poster": "template-housewarming",
       "template-gathering-poster": "template-gathering",
       "template-suya-poster": "template-suya",
       "template-graduation-poster": "template-graduation",
       "template-christmas-poster": "template-christmas",
       "template-movie-poster": "template-movie",
       "template-karaoke-poster": "template-karaoke",
       "template-sendoff-poster": "template-sendoff",
       "ref-editorial": "poster-editorial",
       "ref-grand-affair": "poster-grand-affair",
       "ref-birthday-energy": "monochrome",
       "ref-aso-oke": "aso-oke",
       "ref-garden-note": "art-sage",
       "ref-brutalist": "poster-brutalist",
       "ref-little-moments": "poster-little-moments",
       "ref-after-hours": "poster-after-hours",
       /* retired posters keep a theme so saved events still look right */
       "gold-night": "traditional-gold",
       "violet-pop": "plum",
       garden: "mint",
       "pink-pop": "rosewater",
       "minimal-ink": "paper",
       stripes: "graphite",
       sunset: "sunrise",
       emerald: "heritage-emerald",
       "neon-birthday": "orchid",
       "aso-ebi": "copper",
       "baby-blue": "sky",
       graduate: "poster-navy-gold",
       ivory: "ivory-linen",
       citrus: "terracotta",
       "club-night": "midnight",
       lavender: "poster-lavender",
       "retro-stacked": "poster-butter",
     };
     
     /** Quiet default effect per poster (ids come from the refined effects). */
     export const POSTER_EFFECT: Record<string, string> = {
       "template-chika-poster": "glitter",
       "template-owambe-poster": "dust",
       "template-brunch-poster": "bokeh",
       "template-era-poster": "bokeh",
       "template-sundown-poster": "embers",
       "template-oktoberfest-poster": "dust",
       "template-ramen-poster": "bokeh",
       "template-halloween-poster": "dust",
       "template-beach-poster": "bokeh",
       "template-pool-poster": "bokeh",
       "template-housewarming-poster": "dust",
       "template-gathering-poster": "embers",
       "template-suya-poster": "embers",
       "template-graduation-poster": "dust",
       "template-christmas-poster": "snow",
       "template-movie-poster": "dust",
       "template-karaoke-poster": "bokeh",
       "template-sendoff-poster": "bokeh",
       "ref-editorial": "grain",
       "ref-grand-affair": "dust",
       "ref-birthday-energy": "glitter",
       "ref-aso-oke": "dust",
       "ref-garden-note": "silk",
       "ref-brutalist": "grain",
       "ref-little-moments": "silk",
       "ref-after-hours": "aurora",
       "gold-night": "dust",
       "violet-pop": "bokeh",
       garden: "silk",
       "pink-pop": "glitter",
       "minimal-ink": "grain",
       stripes: "grain",
       sunset: "bokeh",
       emerald: "dust",
       "neon-birthday": "bokeh",
       "aso-ebi": "dust",
       "baby-blue": "silk",
       graduate: "dust",
       ivory: "silk",
       citrus: "bokeh",
       "club-night": "aurora",
       lavender: "silk",
       "retro-stacked": "grain",
     };