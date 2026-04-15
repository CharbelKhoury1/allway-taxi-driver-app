export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  typography: {
    caption: 12,
    small: 13,
    body: 15,
    bodyLg: 16,
    title: 20,
    heading: 28,
  },
  lineHeight: {
    body: 22,
  },
  font: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    displayRegular: "PlusJakartaSans_400Regular",
    displayMedium: "PlusJakartaSans_500Medium",
    displaySemiBold: "PlusJakartaSans_600SemiBold",
    displayBold: "PlusJakartaSans_700Bold",
  },
} as const;

export type AppTheme = typeof theme;
