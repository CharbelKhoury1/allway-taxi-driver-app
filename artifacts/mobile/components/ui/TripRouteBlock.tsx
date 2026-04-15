import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

interface TripRouteBlockProps {
  pickupAddress: string;
  dropoffAddress: string;
  label?: boolean;
  numberOfLines?: number;
}

export function TripRouteBlock({
  pickupAddress,
  dropoffAddress,
  label = false,
  numberOfLines = 1,
}: TripRouteBlockProps) {
  const colors = useColors();

  return (
    <View style={styles.addressSection}>
      <View style={styles.addressRow}>
        <View style={[styles.dot, { backgroundColor: colors.success }]} />
        <View style={styles.addressContent}>
          {label ? (
            <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>Pickup</Text>
          ) : null}
          <Text style={[styles.addressText, { color: colors.foreground }]} numberOfLines={numberOfLines}>
            {pickupAddress}
          </Text>
        </View>
      </View>
      <View style={[styles.addressLine, { borderLeftColor: colors.textTertiary }]} />
      <View style={styles.addressRow}>
        <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
        <View style={styles.addressContent}>
          {label ? (
            <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>Dropoff</Text>
          ) : null}
          <Text style={[styles.addressText, { color: colors.foreground }]} numberOfLines={numberOfLines}>
            {dropoffAddress}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addressSection: {
    gap: 0,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  addressLine: {
    borderLeftWidth: 1,
    height: 16,
    marginLeft: 3.5,
    borderStyle: "dashed",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: theme.typography.caption,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: theme.typography.body,
    fontFamily: "Inter_400Regular",
    lineHeight: theme.lineHeight.body,
  },
});
