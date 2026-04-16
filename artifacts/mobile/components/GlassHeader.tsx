import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";

import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useShift } from "@/contexts/ShiftContext";

export function GlassHeader() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { driver } = useAuth();
  const { isOnline } = useShift();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <BlurView
        intensity={50}
        tint="dark"
        style={[
          styles.container,
          { borderColor: "rgba(255, 255, 255, 0.09)" },
        ]}
      >
        {/* Top-edge shimmer line */}
        <LinearGradient
          colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerLine}
        />

        <View style={styles.content}>
          {/* ── LEFT ── Avatar + Name */}
          <View style={styles.left}>
            <View
              style={[
                styles.avatarContainer,
                {
                  borderColor: isOnline
                    ? "rgba(93, 202, 165, 0.4)"
                    : "rgba(255, 255, 255, 0.1)",
                },
              ]}
            >
              {driver?.photo_url ? (
                <Image
                  source={{ uri: driver.photo_url }}
                  style={styles.avatar}
                />
              ) : (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.logoAvatar}
                  resizeMode="contain"
                />
              )}
              {/* Online indicator dot */}
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: isOnline
                      ? colors.success
                      : "rgba(255,255,255,0.15)",
                    borderColor: "#030303",
                  },
                ]}
              />
            </View>

            <View style={styles.driverInfo}>
              <Text
                style={[
                  styles.title,
                  { color: colors.foreground, fontFamily: theme.font.displayBold },
                ]}
              >
                {driver?.full_name?.split(" ")[0] || "ELITE DRIVER"}
              </Text>
              <View style={styles.row}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="star.fill" size={10} tintColor={colors.primary} />
                ) : (
                  <Feather name="star" size={10} color={colors.primary} />
                )}
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: colors.textTertiary,
                      fontFamily: theme.font.displayBold,
                    },
                  ]}
                >
                  {driver?.rating?.toFixed(2) || "4.98"} · ALLWAY Hub
                </Text>
              </View>
            </View>
          </View>

          {/* ── RIGHT ── Trips pill + Bell */}
          <View style={styles.right}>
            {/* Trips count pill */}
            <View style={styles.statsPill}>
              {Platform.OS === "ios" && (
                <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
              )}
              <View style={styles.statsInner}>
                {Platform.OS === "ios" ? (
                  <SymbolView
                    name="chart.line.uptrend.xyaxis"
                    size={11}
                    tintColor={colors.success}
                  />
                ) : (
                  <Feather name="trending-up" size={11} color={colors.success} />
                )}
                <Text
                  style={[
                    styles.statsText,
                    { color: colors.foreground, fontFamily: theme.font.displayBold },
                  ]}
                >
                  {driver?.total_trips ?? 0}
                </Text>
                <Text
                  style={[
                    styles.statsLabel,
                    { color: colors.textTertiary, fontFamily: theme.font.medium },
                  ]}
                >
                  TRIPS
                </Text>
              </View>
            </View>

            {/* Bell button */}
            <View style={styles.bellWrapper}>
              {Platform.OS === "ios" && (
                <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.bellButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                {Platform.OS === "ios" ? (
                  <SymbolView name="bell.fill" size={15} tintColor={colors.foreground} />
                ) : (
                  <Feather name="bell" size={15} color={colors.foreground} />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  container: {
    height: 84,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    ...theme.shadows.soft,
  },
  shimmerLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    padding: 2,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  logoAvatar: {
    width: 30,
    height: 30,
  },
  driverInfo: {
    gap: 2,
  },
  title: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subtitle: {
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsPill: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    backgroundColor: Platform.OS !== "ios" ? "rgba(255,255,255,0.04)" : "transparent",
  },
  statsInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 13,
    letterSpacing: -0.3,
  },
  statsLabel: {
    fontSize: 8,
    letterSpacing: 1,
    opacity: 0.6,
  },
  bellWrapper: {
    width: 38,
    height: 38,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    backgroundColor: Platform.OS !== "ios" ? "rgba(255,255,255,0.04)" : "transparent",
  },
  bellButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
