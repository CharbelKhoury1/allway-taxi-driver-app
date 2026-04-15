import { Zap, User, MapPinned, ArrowRight } from "lucide-react-native";
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
  withRepeat,
  withSequence,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(1);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!trip) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setSecondsLeft(COUNTDOWN_SECONDS);
    progress.value = 1;
    progress.value = withTiming(0, { duration: COUNTDOWN_SECONDS * 1000 });
    
    pulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true
    );

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!isProcessing) onDecline();
          return 0;
        }
        if (prev <= 15) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const countdownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondsLeft <= 15 ? pulse.value : 1 }],
  }));

  const getBarColor = () => {
    if (secondsLeft <= 15) return colors.destructive;
    if (secondsLeft <= 40) return colors.warning;
    return colors.primary;
  };

  if (!trip) return null;

  const customerName = trip.customers?.full_name || "Guest";
  const isBusy = isProcessing;

  return (
    <Modal visible={!!trip} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, "#FFD700"]}
            style={styles.headerIconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Zap size={32} color="#030303" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
            Priority Dispatch
          </Text>
        </View>

        <View style={styles.timerSection}>
          <Animated.Text style={[styles.countdown, countdownStyle, { color: getBarColor(), fontFamily: theme.font.displayBold }]}>
            {secondsLeft}
          </Animated.Text>
          <Text style={[styles.timerLabel, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>SECONDS REMAINING</Text>
          <View style={[styles.progressTrack, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
            <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: getBarColor() }]} />
          </View>
        </View>

        <AppCard style={styles.detailsCard}>
          <View style={styles.detailHeader}>
            <View style={styles.row}>
              <User size={18} color={colors.primary} />
              <Text style={[styles.customerName, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>{customerName}</Text>
            </View>
            <View style={[styles.fareBadge, { backgroundColor: "rgba(245, 184, 0, 0.1)" }]}>
              <Text style={[styles.fareText, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
                ${formatCurrency(trip.fare_usd || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TripRouteBlock
            pickupAddress={trip.pickup_address}
            dropoffAddress={trip.dropoff_address}
            label
            numberOfLines={2}
          />

          <View style={styles.distanceBadge}>
            <MapPinned size={14} color={colors.textTertiary} />
            <Text style={[styles.distanceText, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>
              {formatDistanceKm(trip.distance_km)} Estimated Distance
            </Text>
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton label="Skip" onPress={onDecline} variant="ghost" disabled={isBusy} flex={1} />
          <AppButton
            label="Accept Request"
            onPress={onAccept}
            icon={<ArrowRight size={20} color="#030303" strokeWidth={2.5} />}
            variant="primary"
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
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 60,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  headerIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#F5B800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  timerSection: {
    alignItems: "center",
    gap: 8,
  },
  countdown: {
    fontSize: 92,
    lineHeight: 92,
    letterSpacing: -4,
  },
  timerLabel: {
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.6,
    marginBottom: 16,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  detailsCard: {
    padding: 24,
    borderRadius: 24,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customerName: {
    fontSize: 20,
  },
  fareBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  fareText: {
    fontSize: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  distanceText: {
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
