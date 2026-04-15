import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.fareContainer}>
          <Text style={[styles.fare, { color: colors.primary }]}>
            ${formatCurrency(trip.fare_usd)}
          </Text>
          {distance ? (
            <Text style={[styles.distance, { color: colors.textSecondary }]}>
              {distance}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.addresses}>
        <TripRouteBlock
          pickupAddress={trip.pickup_address}
          dropoffAddress={trip.dropoff_address}
          numberOfLines={1}
        />
      </View>

      <AppButton
        label="Accept"
        onPress={() => onAccept(trip.id)}
        icon={<Feather name="check" size={18} color={colors.primaryForeground} />}
        variant="primary"
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  fareContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing.sm,
  },
  fare: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  distance: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  addresses: {
    marginBottom: theme.spacing.md,
  },
});
