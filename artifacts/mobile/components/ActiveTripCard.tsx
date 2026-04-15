import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { TripRouteBlock } from "@/components/ui/TripRouteBlock";
import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";
import type { Trip } from "@/types";

interface ActiveTripCardProps {
  trip: Trip;
  onComplete: () => void;
}

export function ActiveTripCard({ trip, onComplete }: ActiveTripCardProps) {
  const colors = useColors();
  const customerName = trip.customers?.full_name || "Customer";
  const customerPhone = trip.customers?.phone || "";

  const openMaps = () => {
    const encoded = encodeURIComponent(trip.pickup_address);
    Linking.openURL(`https://maps.google.com/maps/search/?api=1&query=${encoded}`);
  };

  const callCustomer = () => {
    if (customerPhone) {
      Linking.openURL(`tel:${customerPhone}`);
    }
  };

  return (
    <AppCard style={{ backgroundColor: "rgba(93,202,165,0.12)", borderColor: colors.success }}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: colors.success }]}>
          <Text style={styles.badgeText}>ACTIVE TRIP</Text>
        </View>
        {trip.fare_usd != null && (
          <Text style={[styles.fare, { color: colors.primary }]}>
            ${formatCurrency(trip.fare_usd)}
          </Text>
        )}
      </View>

      <View style={styles.customerRow}>
        <Text style={[styles.customerName, { color: colors.foreground }]}>
          {customerName}
        </Text>
        {customerPhone ? (
          <AppButton
            label="Call"
            onPress={callCustomer}
            icon={<Feather name="phone" size={16} color={colors.success} />}
            variant="secondary"
          />
        ) : null}
      </View>

      <View style={styles.addresses}>
        <TripRouteBlock
          pickupAddress={trip.pickup_address}
          dropoffAddress={trip.dropoff_address}
          numberOfLines={2}
        />
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Open Maps"
          onPress={openMaps}
          icon={<Feather name="map-pin" size={18} color={colors.foreground} />}
          variant="secondary"
          flex={1}
        />

        <AppButton
          label="Complete Trip"
          onPress={onComplete}
          icon={<Feather name="check-circle" size={18} color={colors.primaryForeground} />}
          variant="success"
          flex={1}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#0D0D14",
    letterSpacing: 0.5,
  },
  fare: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  customerName: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  addresses: {
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
