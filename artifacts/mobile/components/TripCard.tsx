import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

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
              <Text style={[styles.distance, { color: colors.textSecondary, fontFamily: theme.font.displayBold }]}>
                {distance.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {Platform.OS === "ios" ? (
          <SymbolView name="chevron.right" size={16} tintColor={colors.textTertiary} />
        ) : (
          <Feather name="chevron-right" size={16} color={colors.textTertiary} />
        )}
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
        icon={
          Platform.OS === "ios" ? (
            <SymbolView name="checkmark" size={18} tintColor="#030303" />
          ) : (
            <Feather name="check" size={18} color="#030303" />
          )
        }
        variant="primary"
        height={54}
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
    borderColor: "rgba(255, 255, 255, 0.04)",
    ...theme.shadows.soft,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  fareContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fare: {
    fontSize: 26,
    letterSpacing: -1,
  },
  distanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distance: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  addresses: {
    marginBottom: 24,
  },
});
