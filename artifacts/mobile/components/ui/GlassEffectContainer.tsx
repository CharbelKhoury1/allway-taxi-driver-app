import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "@/constants/theme";

interface GlassEffectContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * A container that provides a shared glass background for its children on iOS.
 * Simulates the SwiftUI GlassEffectContainer for connected glass elements.
 */
export function GlassEffectContainer({ children, style }: GlassEffectContainerProps) {
  if (Platform.OS !== "ios") {
    return <View style={[styles.fallback, style]}>{children}</View>;
  }

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    ...theme.shadows.soft,
  },
  fallback: {
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
  },
  content: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    alignItems: "center",
  },
});
