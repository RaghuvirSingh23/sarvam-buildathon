import { Platform } from 'react-native';

/**
 * Exact public Sarvam color tokens captured in the repository skill snapshot.
 * Proprietary font binaries are intentionally not bundled; named system faces
 * provide the closest platform-native substitute.
 */
export const sarvamColors = {
  heroCanvas: '#fafafa',
  heroOrange: '#f9730c',
  heroWarmOrange: '#ffb053',
  heroIndigo: '#a5bbfc',
  heroIndigoSoft: '#d5e2ff',
  heroOuter: '#f4f7ff',
  orange: '#e6651b',
  black: '#141414',
  offWhite: '#faf8f5',
  indigo: '#3333cc',
  deepIndigo: '#212191',
  positive: '#6ea335',
  danger: '#b81514',
  buttonTop: '#3a3f5c',
  buttonBottom: '#1e2033',
} as const;

export const sarvamType = {
  display:
    Platform.select({
      ios: 'Avenir Next',
      default: 'sans-serif',
    }) ?? 'sans-serif',
  body:
    Platform.select({
      ios: 'Avenir Next',
      default: 'sans-serif',
    }) ?? 'sans-serif',
  metadata:
    Platform.select({
      ios: 'Menlo',
      default: 'monospace',
    }) ?? 'monospace',
} as const;
