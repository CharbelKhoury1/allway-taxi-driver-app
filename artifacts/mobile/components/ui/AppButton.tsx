import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost"
  | "glass"
  | "glassProminent";

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

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getPalette = () => {
    switch (variant) {
      case "primary":
        return { bg: "transparent", fg: "#030303", border: "transparent" };
      case "secondary":
        return { bg: colors.card, fg: colors.foreground, border: "rgba(255, 255, 255, 0.1)" };
      case "success":
        return { bg: colors.success, fg: "#030303", border: "transparent" };
      case "danger":
        return { bg: "rgba(240, 82, 82, 0.1)", fg: colors.destructive, border: "rgba(240, 82, 82, 0.3)" };
      case "ghost":
        return { bg: "transparent", fg: colors.textSecondary, border: "transparent" };
      case "glass":
        return { bg: "rgba(255, 255, 255, 0.04)", fg: colors.foreground, border: "rgba(255, 255, 255, 0.1)" };
      case "glassProminent":
        return { bg: "rgba(255, 255, 255, 0.08)", fg: colors.foreground, border: "rgba(255, 255, 255, 0.18)" };
      default:
        return { bg: colors.card, fg: colors.foreground, border: colors.cardBorder };
    }
  };

  const palette = getPalette();
  const isGlass = variant === "glass" || variant === "glassProminent";

  return (
    <Animated.View style={[{ flex }, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            backgroundColor:
              Platform.OS === "ios" && isGlass ? "transparent" : palette.bg,
            borderColor: palette.border,
            opacity: isDisabled ? 0.5 : 1,
            height,
          },
        ]}
      >
        {/* Primary gradient fill */}
        {variant === "primary" && (
          <LinearGradient
            colors={["#F5B800", "#E8A800", "#FFD700"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* iOS blur layer for glass variants */}
        {Platform.OS === "ios" && isGlass && (
          <BlurView
            intensity={variant === "glassProminent" ? 45 : 28}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Glass top shimmer highlight */}
        {isGlass && (
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0)"]}
            style={[StyleSheet.absoluteFill, styles.shimmer]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.4 }}
          />
        )}

        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text
              style={[
                styles.text,
                { color: palette.fg, fontFamily: theme.font.displayBold },
              ]}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
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
  shimmer: {
    borderRadius: 18,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
