// Brasil Essencial design tokens (light theme) — mirrored from the app's
// src/styles/tokens.css so the video matches the real product 1:1.

export const colors = {
  bg: "#f5f3ee",
  surface: "#fffefa",
  surfaceSoft: "#ede8df",
  text: "#151713",
  textMuted: "rgba(21, 23, 19, 0.66)",
  border: "rgba(21, 23, 19, 0.12)",
  brand: "#123d2a",
  brandText: "#f5f3ee",
  support: "#d8a900",
  danger: "#c0392b",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xl2: 32,
  pill: 999,
} as const;

// Logical phone viewport (mobile-first, like a 390pt iPhone screen).
export const PHONE = {
  width: 390,
  height: 844,
} as const;

// Brasil "ease" curve used across the app's framer-motion transitions.
export const EASE_BRASIL = [0.2, 0.8, 0.2, 1] as const;
