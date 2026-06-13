import { Platform } from 'react-native';

const tintColorLight = '#6264A7';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const BRAND = {
  primary:      '#6264A7',
  primaryDark:  '#464775',
  primaryLight: '#EEEEF7',
  primaryMid:   '#8B8DC4',
};

export const SURFACE = {
  page:    '#F7F8FC',
  card:    '#FFFFFF',
  sidebar: '#FAFAFE',
  inputBg: '#FAFAFE',
};

export const NEUTRAL = {
  900: '#111827',
  700: '#374151',
  500: '#6B7280',
  300: '#D1D5DB',
  200: '#E5E7EB',
  100: '#F3F4F6',
  50:  '#F9FAFB',
};

export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 999,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
};

export const SHADOWS = {
  web: {
    sm:    { boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08)' },
    md:    { boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)' },
    lg:    { boxShadow: '0 8px 24px rgba(0,0,0,0.10)' },
    card:  { boxShadow: '0 2px 8px rgba(98,100,167,0.10), 0 1px 2px rgba(0,0,0,0.06)' },
    modal: { boxShadow: '0 20px 60px rgba(0,0,0,0.18)' },
  },
  native: {
    sm:    { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
    md:    { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8 },
    lg:    { elevation: 8, shadowColor: '#6264A7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16 },
    card:  { elevation: 3, shadowColor: '#6264A7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8 },
    modal: { elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 32 },
  },
};
