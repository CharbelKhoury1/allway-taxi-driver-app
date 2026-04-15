import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { Trip } from "@/types";

interface DispatchModalProps {
  trip: Trip | null;
  onAccept: () => void;
  onDecline: () => void;
}

const COUNTDOWN_SECONDS = 120;

export function DispatchModal({ trip, onAccept, onDecline }: DispatchModalProps) {
  const colors = useColors();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (!trip) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setSecondsLeft(COUNTDOWN_SECONDS);
    progress.value = 1;
    progress.value = withTiming(0, { duration: COUNTDOWN_SECONDS * 1000 });

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onDecline();
          return 0;
        }
        if (prev === 40 || prev === 15) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [trip?.id]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const getBarColor = () => {
    if (secondsLeft <= 15) return colors.destructive;
    if (secondsLeft <= 40) return colors.warning;
    return colors.primary;
  };

  if (!trip) return null;

  const customerName = trip.customers?.full_name || "Customer";

  return (
    <Modal visible={!!trip} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Feather name="bell" size={32} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            Incoming Trip Request
          </Text>
        </View>

        <View style={styles.timerSection}>
          <Text style={[styles.countdown, { color: getBarColor() }]}>
            {secondsLeft}s
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <Animated.View
              style={[
                styles.progressBar,
                progressStyle,
                { backgroundColor: getBarColor() },
              ]}
            />
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.detailRow}>
            <Feather name="user" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{customerName}</Text>
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <View style={styles.addressSection}>
            <View style={styles.addressRow}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <View style={styles.addressContent}>
                <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>Pickup</Text>
                <Text style={[styles.addressText, { color: colors.foreground }]}>{trip.pickup_address}</Text>
              </View>
            </View>
            <View style={[styles.addressLine, { borderLeftColor: colors.textTertiary }]} />
            <View style={styles.addressRow}>
              <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
              <View style={styles.addressContent}>
                <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>Dropoff</Text>
                <Text style={[styles.addressText, { color: colors.foreground }]}>{trip.dropoff_address}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <View style={styles.statsRow}>
            {trip.fare_usd && (
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fare</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>${trip.fare_usd.toFixed(2)}</Text>
              </View>
            )}
            {trip.distance_km && (
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distance</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{trip.distance_km} km</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onDecline}
            style={({ pressed }) => [
              styles.declineButton,
              { borderColor: colors.destructive, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Text style={[styles.declineText, { color: colors.destructive }]}>Decline</Text>
          </Pressable>
          <Pressable
            onPress={onAccept}
            style={({ pressed }) => [
              styles.acceptButton,
              { backgroundColor: colors.success, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Feather name="check" size={20} color="#0D0D14" />
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  timerSection: {
    alignItems: "center",
    gap: 12,
  },
  countdown: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginLeft: "auto",
  },
  separator: {
    height: 1,
    marginVertical: 14,
  },
  addressSection: {
    gap: 0,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  declineText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  acceptText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#0D0D14",
  },
});
