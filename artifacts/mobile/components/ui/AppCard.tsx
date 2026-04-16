import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { ViewStyle } from "react-native";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type CardVariant = "default" | "elevated" | "subtle";

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** @default "default" */
  variant?: CardVariant;
}

export function AppCard({ children, style, variant = "default" }: AppCardProps) {
  const colors = useColors();

  const shadowStyle =
    variant === "elevated"
      ? theme.shadows.intense
      : variant === "default"
      ? theme.shadows.soft
      : undefined;

  const cardBg =
    variant === "subtle"
      ? "rgba(255, 255, 255, 0.01)"
      : colors.card;

  return (
    <View
      style={[
        styles.outer,
        shadowStyle,
        style,
      ]}
    >
      {/* iOS glass blur backdrop for default + elevated */}
      {Platform.OS === "ios" && variant !== "subtle" && (
        <BlurView
          intensity={variant === "elevated" ? 30 : 20}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Glass gradient shimmer */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.07)",
          "rgba(255, 255, 255, 0.01)",
          "rgba(255, 255, 255, 0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor:
              variant === "elevated"
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(255, 255, 255, 0.07)",
          },
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
});
