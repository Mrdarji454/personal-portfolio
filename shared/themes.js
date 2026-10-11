export const themes = [
  { id: "dark-ember", name: "Dark Ember", description: "Near-black, warm orange, familiar character." },
  { id: "clean-white", name: "Clean White", description: "White, charcoal, a crisp cobalt accent." },
  { id: "midnight-navy", name: "Midnight Navy", description: "Deep navy with luminous cyan accents." },
  { id: "warm-ivory", name: "Warm Ivory", description: "Soft ivory, dark brown, muted terracotta." },
];
export const themeIds = themes.map(({ id }) => id);
export const defaultTheme = "dark-ember";
export const validTheme = (value) => themeIds.includes(value) ? value : defaultTheme;
