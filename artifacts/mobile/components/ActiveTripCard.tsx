import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React, { useEffect } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
import { formatCurrency } from "@/lib/format";
import type { Trip } from "@/types";

interface ActiveTripCardProps {
  trip: Trip;
  onComplete: () => void;
}

export function ActiveTripCard({ trip, onComplete }: ActiveTripCardProps) {
  const colors = useColors();
  const customerName = trip.customers?.full_name || "GUEST PASSENGER";
  const customerPhone = trip.customers?.phone || "";

  // Breathing pulse on the badge
  const badgePulse = useSharedValue(0);
  useEffect(() => {
    badgePulse.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);
  const badgePulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(badgePulse.value, [0, 1], [0.85, 1]),
  }));

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
    <AppCard
      variant="elevated"
      style={[
        styles.card,
        { borderColor: "rgba(93, 202, 165, 0.2)" },
      ]}
    >
      <View style={styles.headerRow}>
        <Animated.View style={badgePulseStyle}>
          <LinearGradient
            colors={[colors.success, "#4CAF50"]}
            style={styles.badge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.badgeText, { color: "#030303", fontFamily: theme.font.displayBold }]}>
              ● ACTIVE MISSION
            </Text>
          </LinearGradient>
        </Animated.View>
        {trip.fare_usd != null && (
          <Text style={[styles.fare, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
            ${formatCurrency(trip.fare_usd)}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.customerRow}>
          <View style={styles.customerInfo}>
            <Text style={[styles.customerLabel, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>PASSENGER</Text>
            <Text style={[styles.customerName, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
              {customerName.toUpperCase()}
            </Text>
          </View>
          {customerPhone ? (
            <Pressable
              onPress={callCustomer}
              style={({ pressed }) => [styles.callButton, { backgroundColor: "rgba(93, 202, 165, 0.1)", opacity: pressed ? 0.7 : 1 }]}
            >
              {Platform.OS === "ios" ? (
                <SymbolView name="phone.fill" size={18} tintColor={colors.success} />
              ) : (
                <Feather name="phone" size={18} color={colors.success} />
              )}
            </Pressable>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.addresses}>
           <Text style={[styles.addressHeader, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>ROUTE PLAN</Text>
           <TripRouteBlock
            pickupAddress={trip.pickup_address}
            dropoffAddress={trip.dropoff_address}
            numberOfLines={2}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Navigator"
          onPress={openMaps}
          icon={
            Platform.OS === "ios" ? (
              <SymbolView name="location.fill" size={18} tintColor={colors.foreground} />
            ) : (
              <Feather name="navigation" size={18} color={colors.foreground} />
            )
          }
          variant="glass"
          flex={1}
          height={60}
        />

        <AppButton
          label="Complete"
          onPress={onComplete}
          icon={
            Platform.OS === "ios" ? (
              <SymbolView name="checkmark.circle.fill" size={18} tintColor={colors.foreground} />
            ) : (
              <Feather name="check" size={18} color={colors.foreground} />
            )
          }
          variant="glassProminent"
          flex={1}
          height={60}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 28,
    borderRadius: 32,
    borderWidth: 1,
    ...theme.shadows.soft,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 2,
  },
  fare: {
    fontSize: 28,
    letterSpacing: -1,
  },
  content: {
    marginBottom: 28,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  customerName: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  addresses: {
    gap: 12,
  },
  addressHeader: {
    fontSize: 9,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
