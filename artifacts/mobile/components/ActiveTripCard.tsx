import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
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
    <View style={[styles.card, { backgroundColor: "rgba(93,202,165,0.12)", borderColor: colors.success }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: colors.success }]}>
          <Text style={styles.badgeText}>ACTIVE TRIP</Text>
        </View>
        {trip.fare_usd && (
          <Text style={[styles.fare, { color: colors.primary }]}>
            ${trip.fare_usd.toFixed(2)}
          </Text>
        )}
      </View>

      <View style={styles.customerRow}>
        <Text style={[styles.customerName, { color: colors.foreground }]}>
          {customerName}
        </Text>
        {customerPhone ? (
          <Pressable onPress={callCustomer} style={styles.phoneButton}>
            <Feather name="phone" size={18} color={colors.success} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.addresses}>
        <View style={styles.addressRow}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={[styles.address, { color: colors.foreground }]} numberOfLines={2}>
            {trip.pickup_address}
          </Text>
        </View>
        <View style={[styles.line, { borderLeftColor: colors.textTertiary }]} />
        <View style={styles.addressRow}>
          <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
          <Text style={[styles.address, { color: colors.foreground }]} numberOfLines={2}>
            {trip.dropoff_address}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={openMaps}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: "rgba(255,255,255,0.08)", transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Feather name="map-pin" size={18} color={colors.foreground} />
          <Text style={[styles.actionText, { color: colors.foreground }]}>Open Maps</Text>
        </Pressable>

        <Pressable
          onPress={onComplete}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.success, flex: 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Feather name="check-circle" size={18} color="#0D0D14" />
          <Text style={[styles.actionText, { color: "#0D0D14" }]}>Complete Trip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  phoneButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(93,202,165,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  addresses: {
    marginBottom: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  line: {
    borderLeftWidth: 1,
    height: 12,
    marginLeft: 3.5,
    borderStyle: "dashed",
  },
  address: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
