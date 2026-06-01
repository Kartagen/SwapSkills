import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * Design tokens for SwapSkill.
 *
 * `spacing` and `radius` are theme-independent constants — import them directly.
 * Colors come from a `Palette` that swaps between light and dark. Get the active
 * palette inside a component with `usePalette()` (see ./ThemeProvider) and build
 * styles with a `makeStyles(palette)` factory so they react to the color scheme.
 *
 * A handful of tokens are FIXED (identical in both schemes) because they sit on
 * top of fixed surfaces — text over a photo gradient or a dark modal scrim.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// Shared across both schemes — brand, semantic and "on-media" tokens.
const shared = {
  // (typed as plain strings so light/dark variants stay structurally compatible)
  // Brand
  primary: '#6366F1', // Indigo 500
  primaryDark: '#4F46E5', // Indigo 600
  secondary: '#EC4899', // Pink 500

  // Semantic
  success: '#10B981', // Emerald 500
  error: '#EF4444', // Red 500
  like: '#22C55E', // Green 500 (swipe-right affordance)
  pass: '#EF4444', // Red 500  (swipe-left affordance)

  // Fixed — always rendered over a photo gradient or dark scrim
  white: '#FFFFFF',
  onMedia: '#FFFFFF', // primary text over images/scrims
  onMediaMuted: '#E5E7EB', // secondary text over images/scrims
  scrim: 'rgba(0,0,0,0.85)',
} as const;

export const lightPalette = {
  ...shared,

  // Surfaces
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',

  // Neutrals — slate scale (light → dark = low → high contrast)
  slate100: '#F1F5F9', // subtle dividers / search field
  slate200: '#E2E8F0', // borders / neutral chips
  slate300: '#CBD5E1', // faint icons (chevrons)
  slate400: '#94A3B8', // muted text (timestamps)
  slate500: '#64748B', // secondary text
  slate800: '#1E293B', // primary text

  // Accent tints
  teachTint: '#EEF2FF', // "can teach" chip
  teachTintStrong: '#E0E7FF', // selected teach chip
  learnTint: '#FFF7ED', // "wants to learn" chip
  learnTintStrong: '#FEF3C7', // selected learn chip
  learnTintAlt: '#FDE68A', // learn chip (profile)
};

export type Palette = typeof lightPalette;

export const darkPalette: Palette = {
  ...shared,

  // Surfaces
  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800

  // Neutrals — same semantic roles, inverted for contrast on dark surfaces
  slate100: '#1E293B', // elevated fill (search field)
  slate200: '#334155', // borders / neutral chips
  slate300: '#475569', // faint icons
  slate400: '#94A3B8', // muted text (still readable on dark)
  slate500: '#CBD5E1', // secondary text (light on dark)
  slate800: '#F1F5F9', // primary text (light on dark)

  // Accent tints — deep so light Paper text stays readable
  teachTint: '#312E81', // Indigo 900
  teachTintStrong: '#3730A3', // Indigo 800
  learnTint: '#7C2D12', // Orange 900
  learnTintStrong: '#78350F', // Amber 900
  learnTintAlt: '#92400E', // Amber 800
};

/** Static light palette for the rare style that can't use the hook. Prefer usePalette(). */
export const palette = lightPalette;

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightPalette.primary,
    onPrimary: lightPalette.white,
    secondary: lightPalette.secondary,
    onSecondary: lightPalette.white,
    background: lightPalette.background,
    surface: lightPalette.surface,
    error: lightPalette.error,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkPalette.primary,
    onPrimary: darkPalette.white,
    secondary: darkPalette.secondary,
    onSecondary: darkPalette.white,
    background: darkPalette.background,
    surface: darkPalette.surface,
    error: darkPalette.error,
  },
};

/** Back-compat alias — light theme. App now selects via ThemeProvider. */
export const theme = lightTheme;
