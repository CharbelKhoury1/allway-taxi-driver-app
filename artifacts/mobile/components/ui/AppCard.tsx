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
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
});
