import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function AppCard({ children, style }: AppCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.outer, style]}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
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
