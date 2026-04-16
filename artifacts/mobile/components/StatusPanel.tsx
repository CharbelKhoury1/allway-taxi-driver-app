import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";

interface StatusPanelProps {
  realtimeConnected: boolean;
  gpsConnected: boolean;
  wakeLockActive: boolean;
}

export function StatusPanel({
  realtimeConnected,
  gpsConnected,
  wakeLockActive,
}: StatusPanelProps) {
  const colors = useColors();

  const items = [
    {
      label: "Connection",
      connected: realtimeConnected,
      icon: "wifi" as const,
    },
    {
      label: "GPS Signal",
      connected: gpsConnected,
      icon: "navigation" as const,
    },
    {
      label: "Wake Lock",
      connected: wakeLockActive,
      icon: "smartphone" as const,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.textSecondary, fontFamily: theme.font.displayBold }]}>Shift Systems</Text>
        <View style={[styles.livePill, { borderColor: "rgba(93, 202, 165, 0.28)" }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.liveText, { color: colors.success, fontFamily: theme.font.displayBold }]}>LIVE</Text>
        </View>
      </View>
      <View style={styles.items}>
        {items.map((item) => (
          <View
            key={item.label}
            style={[
              styles.item,
              {
                backgroundColor: item.connected ? "rgba(93, 202, 165, 0.08)" : "rgba(255, 255, 255, 0.035)",
                borderColor: item.connected ? "rgba(93, 202, 165, 0.18)" : colors.cardBorder,
              },
            ]}
          >
            <Feather
              name={item.icon}
              size={15}
              color={item.connected ? colors.success : colors.textTertiary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: item.connected ? colors.foreground : colors.textTertiary,
                  fontFamily: theme.font.medium,
                },
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  items: {
    flexDirection: "row",
    gap: 8,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  label: {
    fontSize: 11,
  },
});
