/* Ambient effect catalogue shown in the style rail. */

export type EffectDef = {
  id: string;
  name: string;
  icon: string;
  motion?: "fall" | "rise" | "float";
};

export const effects: EffectDef[] = [
  { id: "none", name: "None", icon: "none" },
  { id: "glow", name: "Glow", icon: "glow" },
  { id: "grain", name: "Grain", icon: "grain" },
  // Large light-beam effects. `motion` is only here so the picker shows their icon;
  // Themeshell draws them by id.
  { id: "beams", name: "Spotlights", icon: "beams", motion: "float" },
  { id: "stage", name: "Stage lights", icon: "stage", motion: "float" },
  { id: "neon", name: "Neon lights", icon: "neon", motion: "float" },
  { id: "sparkle", name: "Sparkle", icon: "sparkle", motion: "float" },
  { id: "confetti", name: "Confetti", icon: "confetti", motion: "fall" },
  { id: "money", name: "Money spray", icon: "money", motion: "fall" },
  { id: "balloons", name: "Balloons", icon: "balloon", motion: "rise" },
  { id: "hearts", name: "Hearts", icon: "heart", motion: "rise" },
  { id: "music", name: "Music", icon: "music", motion: "rise" },
  { id: "stars", name: "Stars", icon: "star", motion: "float" },
  { id: "fireworks", name: "Fireworks", icon: "fireworks", motion: "float" },
  { id: "petals", name: "Petals", icon: "flower", motion: "fall" },
  { id: "leaves", name: "Leaves", icon: "leaf", motion: "fall" },
  { id: "snow", name: "Snow", icon: "snow", motion: "fall" },
  { id: "bats", name: "Bats", icon: "bat", motion: "float" },
  { id: "ghosts", name: "Ghosts", icon: "ghost", motion: "float" },
  { id: "spiders", name: "Spiders", icon: "spider", motion: "fall" },
  // Refined, low-key effects for traditional ceremonies, conventions and the
  // quieter, more grown-up parties. They move slowly and never compete with text.
  { id: "bokeh", name: "Bokeh", icon: "sparkle", motion: "float" },
  { id: "dust", name: "Gold dust", icon: "sparkle", motion: "rise" },
  { id: "embers", name: "Embers", icon: "sparkle", motion: "rise" },
  { id: "lanterns", name: "Lanterns", icon: "balloon", motion: "rise" },
  { id: "glitter", name: "Glitter", icon: "star", motion: "float" },
  { id: "aurora", name: "Aurora", icon: "beams", motion: "float" },
  { id: "silk", name: "Silk", icon: "piece-ribbon", motion: "fall" },
];
