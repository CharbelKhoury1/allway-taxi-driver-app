import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface PowerButtonProps {
  isOnline: boolean;
  isLocating: boolean;
  disabled: boolean;
  onPress: () => void;
}

export function PowerButton({
  isOnline,
  isLocating,
  disabled,
  onPress,
}: PowerButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (isOnline) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        true,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 }),
        ),
        -1,
        true,
      );
    } else if (!isLocating) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        true,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.2, { duration: 1500 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1);
      glowOpacity.value = withTiming(0.3);
    }
  }, [isOnline, isLocating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const bgColor = isOnline
    ? colors.success
    : isLocating
      ? colors.warning
      : colors.primary;

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [{ opacity: pressed && !disabled ? 0.9 : 1 }]}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            {
              backgroundColor: bgColor,
              shadowColor: bgColor,
            },
          ]}
        />
        <Animated.View
          style={[styles.button, animatedStyle, { backgroundColor: bgColor }]}
        >
          {isLocating ? (
            <Animated.View style={styles.spinner}>
              <Feather name="loader" size={28} color="#0D0D14" />
            </Animated.View>
          ) : (
            <Feather name="power" size={28} color="#0D0D14" />
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    transform: [{ rotate: "0deg" }],
  },
});
