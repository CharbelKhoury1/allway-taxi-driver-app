import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";

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
    primary: { bg: colors.primary, fg: "#030303", border: "transparent" },
    secondary: { bg: colors.secondary, fg: colors.foreground, border: colors.cardBorder },
    success: { bg: colors.success, fg: "#030303", border: "transparent" },
    danger: { bg: "transparent", fg: colors.destructive, border: colors.destructive },
    ghost: { bg: "transparent", fg: colors.textSecondary, border: "transparent" },
  }[variant];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const Content = () => (
    <View style={styles.content}>
      {icon}
      <Text style={[styles.text, { color: palette.fg, fontFamily: theme.font.displayBold }]}>{label}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variant === "primary" ? "transparent" : palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          flex,
        },
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={["#F5B800", "#FFD700"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : null}
      
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Content />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  text: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
