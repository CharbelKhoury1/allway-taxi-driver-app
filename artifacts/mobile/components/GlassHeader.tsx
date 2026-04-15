import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";

import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export function GlassHeader() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { driver } = useAuth();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <BlurView intensity={45} tint="dark" style={[styles.container, { borderColor: "rgba(255, 255, 255, 0.08)", ...theme.shadows.soft }]}>
        <View style={styles.content}>
          <View style={styles.left}>
            <View style={[styles.avatarContainer, { borderColor: "rgba(255, 255, 255, 0.1)" }]}>
              {driver?.photo_url ? (
                <Image source={{ uri: driver.photo_url }} style={styles.avatar} />
              ) : (
                <Image 
                  source={require("@/assets/images/logo.png")} 
                  style={styles.logoAvatar}
                  resizeMode="contain"
                />
              )}
            </View>
            <View style={styles.driverInfo}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                {driver?.full_name?.split(" ")[0] || "ELITE DRIVER"}
              </Text>
              <View style={styles.row}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="star.fill" size={10} tintColor={colors.primary} />
                ) : (
                  <Feather name="star" size={10} color={colors.primary} />
                )}
                <Text style={[styles.subtitle, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>
                   {driver?.rating?.toFixed(2) || "4.98"} • ALLWAY Hub
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.right}>
            <View style={styles.statsWrapper}>
              {Platform.OS === "ios" && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
              <View style={[styles.stats, { borderColor: "rgba(255, 255, 255, 0.1)" }]}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="chart.line.uptrend.xyaxis" size={12} tintColor={colors.success} />
                ) : (
                  <Feather name="trending-up" size={12} color={colors.success} />
                )}
                <Text style={[styles.statsText, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                  {driver?.total_trips || 0}
                </Text>
              </View>
            </View>

            <View style={styles.actionWrapper}>
              {Platform.OS === "ios" && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
              <TouchableOpacity style={[styles.actionButton, { borderColor: "rgba(255, 255, 255, 0.1)" }]}>
                 {Platform.OS === "ios" ? (
                  <SymbolView name="bell.fill" size={16} tintColor={colors.foreground} />
                ) : (
                  <Feather name="bell" size={16} color={colors.foreground} />
                )}
              </TouchableOpacity>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    padding: 2,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  logoAvatar: {
    width: 32,
    height: 32,
  },
  driverInfo: {
    gap: 1,
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
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statsWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 13,
    letterSpacing: -0.3,
  },
  actionWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  actionButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
