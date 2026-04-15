import { Phone, Navigation, Check } from "lucide-react-native";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
  const customerName = trip.customers?.full_name || "Guest Passenger";
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
    <AppCard style={{ backgroundColor: "rgba(93, 202, 165, 0.05)", borderColor: "rgba(93, 202, 165, 0.2)", borderRadius: 28, padding: 24 }}>
      <View style={styles.headerRow}>
        <LinearGradient
          colors={[colors.success, "#4CAF50"]}
          style={styles.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.badgeText, { color: "#030303", fontFamily: theme.font.displayBold }]}>
            MISSION ACTIVE
          </Text>
        </LinearGradient>
        {trip.fare_usd != null && (
          <Text style={[styles.fare, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
            ${formatCurrency(trip.fare_usd)}
          </Text>
        )}
      </View>

      <View style={styles.customerRow}>
        <View style={styles.customerInfo}>
          <Text style={[styles.customerLabel, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>PASSENGER</Text>
          <Text style={[styles.customerName, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
            {customerName}
          </Text>
        </View>
        {customerPhone ? (
          <AppButton
            label="Call"
            onPress={callCustomer}
            icon={<Phone size={16} color={colors.success} />}
            variant="ghost"
          />
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.addresses}>
        <TripRouteBlock
          pickupAddress={trip.pickup_address}
          dropoffAddress={trip.dropoff_address}
          numberOfLines={2}
          label
        />
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Navigator"
          onPress={openMaps}
          icon={<Navigation size={18} color={colors.foreground} />}
          variant="secondary"
          flex={1}
        />

        <AppButton
          label="Complete"
          onPress={onComplete}
          icon={<Check size={18} color="#030303" strokeWidth={3} />}
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
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 2,
  },
  fare: {
    fontSize: 24,
    letterSpacing: -1,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  customerInfo: {
    gap: 4,
  },
  customerLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  customerName: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  addresses: {
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
