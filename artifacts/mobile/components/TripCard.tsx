import { ChevronRight, Check } from "lucide-react-native";
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
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.fareContainer}>
          <Text style={[styles.fare, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
            ${formatCurrency(trip.fare_usd || 0)}
          </Text>
          {distance && (
            <View style={[styles.distanceBadge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
              <Text style={[styles.distance, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>
                {distance}
              </Text>
            </View>
          )}
        </View>
        <ChevronRight size={20} color={colors.textTertiary} />
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
        icon={<Check size={18} color="#030303" strokeWidth={3} />}
        variant="primary"
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  fareContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fare: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  distanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  distance: {
    fontSize: 12,
  },
  addresses: {
    marginBottom: 20,
  },
});
