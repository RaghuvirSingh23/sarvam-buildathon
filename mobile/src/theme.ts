import tokenSnapshot from './theme/sarvam-theme.tokens.json';

const snapshotColors = tokenSnapshot.colors as Record<string, string>;

function color(name: string) {
  return snapshotColors[name];
}

export const COLORS = {
  canvas: color('--color-sf'),
  surface: '#ffffff',
  surfaceSecondary: color('--color-sf-secondary'),
  surfaceTertiary: color('--color-sf-tertiary'),
  border: color('--color-st'),
  borderQuiet: color('--color-st-secondary'),
  text: color('--color-tx'),
  textSecondary: color('--color-tx-secondary'),
  textTertiary: color('--color-tx-tertiary'),
  textInverse: color('--color-tx-inverse'),
  nearBlack: color('--color-sr-black'),
  indigo: color('--color-sr-indigo-800'),
  indigoDeep: color('--color-sr-indigo-900'),
  indigoMid: color('--color-sr-indigo-600'),
  indigoPale: color('--color-sr-indigo-100'),
  indigoSoft: color('--color-sr-indigo-300'),
  orange: color('--color-sr-orange-800'),
  orangeWarm: color('--color-sr-orange-600'),
  orangeSoft: color('--color-sr-orange-300'),
  orangePale: color('--color-sr-orange-100'),
  positive: color('--color-ct-positive-primary'),
  danger: color('--color-ct-danger-primary'),
  buttonTop: '#3a3f5c',
  buttonBottom: '#1e2033',
  heroOrange: '#f9730c',
  heroWarm: '#ffb053',
  heroIndigo: '#a5bbfc',
  heroFade: '#f4f7ff',
} as const;

export const FONTS = {
  display: 'DMSerifDisplay_400Regular',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  metadata: 'IBMPlexMono_400Regular',
  metadataMedium: 'IBMPlexMono_500Medium',
} as const;

export const SPACE = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const RADIUS = {
  small: 8,
  control: 12,
  card: 16,
  cardLarge: 24,
  panel: 32,
  nav: 34,
  pill: 999,
} as const;

export const TYPE = {
  hero: { fontSize: 44, lineHeight: 47, letterSpacing: -1.1 },
  section: { fontSize: 30, lineHeight: 40 },
  title: { fontSize: 20, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 12, lineHeight: 18, letterSpacing: 1.2 },
  helper: { fontSize: 13, lineHeight: 19 },
} as const;

export const LAYOUT = {
  touchTarget: 44,
  phoneGutter: 16,
  wideContent: 760,
  tabletBreakpoint: 768,
} as const;
