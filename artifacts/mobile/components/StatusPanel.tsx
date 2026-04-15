import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

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
      <Text style={[styles.title, { color: colors.textSecondary }]}>Shift Status</Text>
      <View style={styles.items}>
        {items.map((item) => (
          <View key={item.label} style={styles.item}>
            <Feather
              name={item.icon}
              size={14}
              color={item.connected ? colors.success : colors.textTertiary}
            />
            <Text
              style={[
                styles.label,
                { color: item.connected ? colors.foreground : colors.textTertiary },
              ]}
            >
              {item.label}
            </Text>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: item.connected
                    ? colors.success
                    : colors.textTertiary,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  items: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
