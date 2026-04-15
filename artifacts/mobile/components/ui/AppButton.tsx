import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "success" | "danger";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  flex?: number;
}

export function AppButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
  flex,
}: AppButtonProps) {
  const colors = useColors();
  const isDisabled = disabled || loading;

  const palette = {
    primary: { bg: colors.primary, fg: colors.primaryForeground, border: colors.primary },
    secondary: { bg: colors.muted, fg: colors.foreground, border: colors.cardBorder },
    success: { bg: colors.success, fg: colors.primaryForeground, border: colors.success },
    danger: { bg: "transparent", fg: colors.destructive, border: colors.destructive },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          flex,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  text: {
    fontSize: theme.typography.bodyLg,
    fontFamily: "Inter_700Bold",
  },
});
