import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";

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
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (isOnline || isLocating) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 2500 }),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [isOnline, isLocating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 0.5, 1], [1, 1.05, 1]) }],
  }));

  const glow1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.8]) }],
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0.3, 0.1, 0]),
  }));

  const bgColor = isOnline
    ? colors.success
    : isLocating
      ? colors.warning
      : colors.primary;

  const handlePress = () => {
    if (disabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [{ 
        opacity: (pressed && !disabled) || disabled ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }]
      }]}
    >
      <View style={styles.container}>
        {(isOnline || isLocating) && (
          <Animated.View
            style={[
              styles.glow,
              glow1Style,
              { backgroundColor: bgColor }
            ]}
          />
        )}
        <Animated.View
          style={[styles.button, animatedStyle, { backgroundColor: bgColor }]}
        >
          {isLocating ? (
             Platform.OS === "ios" ? (
               <SymbolView name="rays" size={28} tintColor="#030303" />
             ) : (
               <Feather name="loader" size={28} color="#030303" />
             )
          ) : (
            Platform.OS === "ios" ? (
              <SymbolView name="power" size={28} tintColor="#030303" />
            ) : (
              <Feather name="power" size={28} color="#030303" />
            )
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  button: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
});
