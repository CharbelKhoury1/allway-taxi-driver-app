export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    pill: 999,
  },
  typography: {
    caption: 11,
    small: 12,
    body: 14,
    bodyLg: 15,
    title: 18,
    heading: 24,
  },
  lineHeight: {
    body: 20,
  },
} as const;

export type AppTheme = typeof theme;
