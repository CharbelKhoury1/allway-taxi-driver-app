import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Trip } from "@/types";

interface TripCardProps {
  trip: Trip;
  onAccept: (tripId: string) => void;
}

export function TripCard({ trip, onAccept }: TripCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.fareContainer}>
          <Text style={[styles.fare, { color: colors.primary }]}>
            ${trip.fare_usd?.toFixed(2) || "0.00"}
          </Text>
          {trip.distance_km && (
            <Text style={[styles.distance, { color: colors.textSecondary }]}>
              {trip.distance_km} km
            </Text>
          )}
        </View>
      </View>

      <View style={styles.addresses}>
        <View style={styles.addressRow}>
          <View
            style={[styles.dot, { backgroundColor: colors.success }]}
          />
          <Text
            style={[styles.address, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {trip.pickup_address}
          </Text>
        </View>
        <View style={[styles.line, { borderLeftColor: colors.textTertiary }]} />
        <View style={styles.addressRow}>
          <View
            style={[styles.dot, { backgroundColor: colors.destructive }]}
          />
          <Text
            style={[styles.address, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {trip.dropoff_address}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onAccept(trip.id)}
        style={({ pressed }) => [
          styles.acceptButton,
          { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
      >
        <Feather name="check" size={18} color="#0D0D14" />
        <Text style={styles.acceptText}>Accept</Text>
      </Pressable>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  fareContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
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
    marginBottom: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    borderLeftWidth: 1,
    height: 16,
    marginLeft: 3.5,
    borderStyle: "dashed",
  },
  address: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  acceptText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#0D0D14",
  },
});
