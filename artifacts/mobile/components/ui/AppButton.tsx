import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost" | "glass" | "glassProminent";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  flex?: number;
  height?: number;
}

export function AppButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
  flex,
  height = 54,
}: AppButtonProps) {
  const colors = useColors();
  const isDisabled = disabled || loading;

  const getPalette = () => {
    switch (variant) {
      case "primary": return { bg: "transparent", fg: "#030303", border: "transparent" };
      case "success": return { bg: colors.success, fg: "#030303", border: "transparent" };
      case "danger": return { bg: "transparent", fg: colors.destructive, border: colors.destructive };
      case "ghost": return { bg: "transparent", fg: colors.textSecondary, border: "transparent" };
      case "glass": return { bg: "rgba(255, 255, 255, 0.05)", fg: colors.foreground, border: "rgba(255, 255, 255, 0.1)" };
      case "glassProminent": return { bg: "rgba(255, 255, 255, 0.12)", fg: colors.foreground, border: "rgba(255, 255, 255, 0.2)" };
      default: return { bg: colors.secondary, fg: colors.foreground, border: colors.cardBorder };
    }
  };

  const palette = getPalette();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: Platform.OS === "ios" && (variant === "glass" || variant === "glassProminent") ? "transparent" : palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          flex,
          height,
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

      {Platform.OS === "ios" && (variant === "glass" || variant === "glassProminent") && (
        <BlurView
          intensity={variant === "glassProminent" ? 40 : 25}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      )}

      {({ pressed }) => (
        <>
          {/* Interactive Specular Highlight / Touch Illumination */}
          {pressed && Platform.OS === "ios" && (
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          )}

          {loading ? (
            <ActivityIndicator color={palette.fg} />
          ) : (
            <View style={styles.content}>
              {icon}
              <Text style={[styles.text, { color: palette.fg, fontFamily: theme.font.displayBold }]}>
                {label}
              </Text>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  text: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
