import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

interface StateViewProps {
  mode: "loading" | "empty" | "error";
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function StateView({ mode, title, description, onRetry }: StateViewProps) {
  const colors = useColors();

  const iconName = mode === "error" ? "alert-circle" : "inbox";
  const iconColor =
    mode === "error" ? colors.destructive : mode === "loading" ? colors.primary : colors.textTertiary;

  return (
    <View style={styles.container}>
      {mode === "loading" ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Feather name={iconName} size={34} color={iconColor} />
      )}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      ) : null}
      {mode === "error" && onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[styles.retryButton, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingVertical: 56,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.bodyLg,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: theme.typography.body,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  retryButton: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  retryText: {
    fontSize: theme.typography.body,
    fontFamily: "Inter_600SemiBold",
  },
});
