import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { TripRouteBlock } from "@/components/ui/TripRouteBlock";
import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDistanceKm } from "@/lib/format";
import type { Trip } from "@/types";

interface DispatchModalProps {
  trip: Trip | null;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
  isProcessing?: boolean;
}

const COUNTDOWN_SECONDS = 120;

export function DispatchModal({
  trip,
  onAccept,
  onDecline,
  isProcessing = false,
}: DispatchModalProps) {
  const colors = useColors();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          if (!isSubmitting && !isProcessing) {
            onDecline();
          }
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
  const isBusy = isSubmitting || isProcessing;
  const distance = formatDistanceKm(trip.distance_km);

  const handleAccept = async () => {
    if (isBusy) return;
    setIsSubmitting(true);
    try {
      await onAccept();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (isBusy) return;
    setIsSubmitting(true);
    try {
      await onDecline();
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <AppCard style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Feather name="user" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{customerName}</Text>
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <TripRouteBlock
            pickupAddress={trip.pickup_address}
            dropoffAddress={trip.dropoff_address}
            label
            numberOfLines={3}
          />

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <View style={styles.statsRow}>
            {trip.fare_usd != null && (
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fare</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>${formatCurrency(trip.fare_usd)}</Text>
              </View>
            )}
            {distance ? (
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distance</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{distance}</Text>
              </View>
            ) : null}
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            label="Decline"
            onPress={handleDecline}
            variant="danger"
            disabled={isBusy}
            loading={isBusy}
            flex={1}
          />
          <AppButton
            label="Accept"
            onPress={handleAccept}
            icon={<Feather name="check" size={20} color={colors.primaryForeground} />}
            variant="success"
            disabled={isBusy}
            loading={isBusy}
            flex={2}
          />
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
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: 0,
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
    gap: theme.spacing.md,
  },
});
