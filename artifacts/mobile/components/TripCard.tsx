import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { TripRouteBlock } from "@/components/ui/TripRouteBlock";
import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDistanceKm } from "@/lib/format";
import type { Trip } from "@/types";

interface TripCardProps {
  trip: Trip;
  onAccept: (tripId: string) => void;
}

export function TripCard({ trip, onAccept }: TripCardProps) {
  const colors = useColors();
  const distance = formatDistanceKm(trip.distance_km);
  const customerName = trip.customers?.full_name;

  // Pulse the NEW badge
  const newPulse = useSharedValue(0);
  useEffect(() => {
    newPulse.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);
  const newBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(newPulse.value, [0, 1], [0.7, 1]),
    transform: [{ scale: interpolate(newPulse.value, [0, 1], [0.97, 1.02]) }],
  }));

  return (
    <AppCard
      variant="elevated"
      style={[styles.card, { borderColor: "rgba(255, 184, 0, 0.15)" }]}
    >
      <View style={styles.header}>
        <View style={styles.fareRow}>
          <Text style={[styles.fare, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
            ${formatCurrency(trip.fare_usd || 0)}
          </Text>
          <Animated.View
            style={[
              styles.newBadge,
              newBadgeStyle,
              { backgroundColor: "rgba(255, 184, 0, 0.15)" },
            ]}
          >
            <Text style={[styles.newBadgeText, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
              NEW
            </Text>
          </Animated.View>
        </View>

        <View style={styles.metaRow}>
          {customerName && (
            <View style={[styles.customerChip, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
              {Platform.OS === "ios" ? (
                <SymbolView name="person.fill" size={10} tintColor={colors.textTertiary} />
              ) : (
                <Feather name="user" size={10} color={colors.textTertiary} />
              )}
              <Text style={[styles.customerName, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>
                {customerName}
              </Text>
            </View>
          )}
          {distance && (
            <View style={[styles.distanceBadge, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
              {Platform.OS === "ios" ? (
                <SymbolView name="location.fill" size={10} tintColor={colors.textTertiary} />
              ) : (
                <Feather name="map-pin" size={10} color={colors.textTertiary} />
              )}
              <Text style={[styles.distance, { color: colors.textSecondary, fontFamily: theme.font.displayBold }]}>
                {distance.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.05)" }]} />

      <View style={styles.addresses}>
        <TripRouteBlock
          pickupAddress={trip.pickup_address}
          dropoffAddress={trip.dropoff_address}
          numberOfLines={1}
        />
      </View>

      <AppButton
        label="Accept Job"
        onPress={() => onAccept(trip.id)}
        icon={
          Platform.OS === "ios" ? (
            <SymbolView name="checkmark" size={18} tintColor="#030303" />
          ) : (
            <Feather name="check" size={18} color="#030303" />
          )
        }
        variant="primary"
        height={56}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
  },
  header: {
    marginBottom: 16,
    gap: 10,
  },
  fareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fare: {
    fontSize: 30,
    letterSpacing: -1,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  customerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 12,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distance: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  addresses: {
    marginBottom: 20,
  },
});
