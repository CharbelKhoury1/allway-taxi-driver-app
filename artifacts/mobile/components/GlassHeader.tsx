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
      <BlurView intensity={30} tint="dark" style={[styles.container, { borderColor: "rgba(255, 255, 255, 0.12)" }]}>
        <View style={styles.content}>
          <View style={styles.left}>
            <View style={[styles.avatarContainer, { borderColor: colors.cardBorder }]}>
              {driver?.photo_url ? (
                <Image source={{ uri: driver.photo_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
                  {Platform.OS === "ios" ? (
                    <SymbolView name="person.fill" size={20} tintColor={colors.textSecondary} />
                  ) : (
                    <Feather name="user" size={20} color={colors.textSecondary} />
                  )}
                </View>
              )}
            </View>
            <View>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                {driver?.full_name?.split(" ")[0] || "Driver Account"}
              </Text>
              <View style={styles.row}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="star.fill" size={12} tintColor={colors.primary} />
                ) : (
                  <Feather name="star" size={12} color={colors.primary} />
                )}
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>
                   {driver?.rating?.toFixed(2) || "5.00"} • PRO
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.stats, { backgroundColor: "rgba(255, 255, 255, 0.08)" }]}>
            {Platform.OS === "ios" ? (
              <SymbolView name="chart.line.uptrend.xyaxis" size={14} tintColor={colors.success} />
            ) : (
              <Feather name="trending-up" size={14} color={colors.success} />
            )}
            <Text style={[styles.statsText, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
              {driver?.total_trips || 0}
            </Text>
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
    height: 72,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    padding: 2,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  statsText: {
    fontSize: 14,
  },
});
