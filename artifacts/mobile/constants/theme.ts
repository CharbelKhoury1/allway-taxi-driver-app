export const theme = {
  spacing: {
    screen: 24,
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
    lg: 20,
    xl: 28,
    pill: 999,
  },
  typography: {
    caption: 11,
    small: 12,
    body: 14,
    bodyLg: 16,
    title: 22,
    heading: 32,
  },
  lineHeight: {
    body: 20,
  },
  font: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    displayRegular: "Inter_400Regular",
    displayMedium: "Inter_500Medium",
    displaySemiBold: "Inter_600SemiBold",
    displayBold: "Inter_700Bold",
  },
  shadows: {
    soft: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    intense: {
      shadowColor: "#F5B800",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
  },
} as const;

export type AppTheme = typeof theme;
