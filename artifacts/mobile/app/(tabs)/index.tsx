import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ActiveTripCard } from "@/components/ActiveTripCard";
import { DispatchModal } from "@/components/DispatchModal";
import { PowerButton } from "@/components/PowerButton";
import { StatusPanel } from "@/components/StatusPanel";
import { TripCard } from "@/components/TripCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { GlassHeader } from "@/components/GlassHeader";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useShift } from "@/contexts/ShiftContext";
import { useColors } from "@/hooks/useColors";

function formatShiftTime(startTime: number | null): string {
  if (!startTime) return "00:00:00";
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function RadarSweep() {
  const colors = useColors();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 4000 }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 2500 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.4]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0]),
  }));

  return (
    <View style={styles.radarContainer}>
      <View style={[styles.radarBg, { borderColor: "rgba(255,184,0,0.15)" }]}>
        <Animated.View style={[styles.radarPulse, pulseStyle, { backgroundColor: colors.primary }]} />
        <Animated.View
          style={[
            styles.radarSweep,
            animatedStyle,
            { borderTopColor: colors.primary },
          ]}
        />
        <View style={[styles.radarCenter, { backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.radarText, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>
        Live trip scanning active...
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { driver } = useAuth();
  const {
    isOnline,
    isLocating,
    shiftStartTime,
    availableTrips,
    activeTrip,
    pendingDispatch,
    gpsConnected,
    realtimeConnected,
    wakeLockActive,
    goOnline,
    goOffline,
    acceptBroadcastTrip,
    acceptDispatch,
    declineDispatch,
    completeTrip,
    dispatchActionLoading,
    lastError,
    clearError,
  } = useShift();

  const [shiftDisplay, setShiftDisplay] = useState("00:00:00");

  useEffect(() => {
    if (!isOnline || !shiftStartTime) {
      setShiftDisplay("00:00:00");
      return;
    }
    const timer = setInterval(() => {
      setShiftDisplay(formatShiftTime(shiftStartTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOnline, shiftStartTime]);

  const hasActiveTrip = !!activeTrip;

  const handlePowerPress = () => {
    if (isOnline) goOffline();
    else goOnline();
  };

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <GlassHeader />
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 100 + webTopPadding, paddingBottom: 150 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AppCard
          style={[
            styles.mainShiftCard,
            {
              backgroundColor: isOnline ? "transparent" : "rgba(255, 255, 255, 0.02)",
              borderColor: isOnline ? "rgba(255, 184, 0, 0.2)" : colors.cardBorder,
            },
          ]}
        >
          <View style={styles.shiftHeader}>
            <View>
              <Text style={[styles.statusLabel, { color: isOnline ? colors.success : colors.textTertiary, fontFamily: theme.font.displayBold }]}>
                {isOnline ? "OPERATIONAL" : isLocating ? "INITIALIZING..." : "SYSTEM STANDBY"}
              </Text>
              {isOnline ? (
                <Text style={[styles.shiftTimer, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                  {shiftDisplay}
                </Text>
              ) : (
                <Text style={[styles.offlineText, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>
                  Go online to receive jobs
                </Text>
              )}
            </View>
            <PowerButton
              isOnline={isOnline}
              isLocating={isLocating}
              disabled={hasActiveTrip}
              onPress={handlePowerPress}
            />
          </View>

          {isOnline && (
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="bolt.fill" size={14} tintColor={colors.primary} />
                ) : (
                  <Feather name="zap" size={14} color={colors.primary} />
                )}
                <Text style={[styles.quickStatText, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>Hot Area</Text>
              </View>
              <View style={styles.statDot} />
              <View style={styles.quickStatItem}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="shield.fill" size={14} tintColor={colors.success} />
                ) : (
                  <Feather name="shield" size={14} color={colors.success} />
                )}
                <Text style={[styles.quickStatText, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>Secure</Text>
              </View>
            </View>
          )}
        </AppCard>

        {isOnline && activeTrip && (
          <ActiveTripCard trip={activeTrip} onComplete={completeTrip} />
        )}

        {isOnline && !activeTrip && (
          <View>
            {availableTrips.length === 0 ? (
              <RadarSweep />
            ) : (
              <View style={styles.tripsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                    Incoming Jobs
                  </Text>
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.badgeText, { color: "#030303", fontFamily: theme.font.displayBold }]}>
                      {availableTrips.length}
                    </Text>
                  </View>
                </View>
                {availableTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onAccept={acceptBroadcastTrip} />
                ))}
              </View>
            )}
          </View>
        )}

        {!hasActiveTrip && (
          <View style={styles.chartWrapper}>
            <WeeklyChart />
          </View>
        )}

        {lastError ? (
          <AppCard style={[styles.errorCard, { borderColor: colors.destructive }]}>
            <Text style={[styles.errorText, { color: colors.destructive, fontFamily: theme.font.medium }]}>{lastError}</Text>
            <AppButton label="Dismiss" onPress={clearError} variant="secondary" />
          </AppCard>
        ) : null}

        <View style={styles.actionGrid}>
          <Pressable
            onPress={() => Linking.openURL("tel:+96170123456")}
            style={({ pressed }) => [styles.heroAction, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
          >
            {Platform.OS === "ios" ? (
              <SymbolView name="phone.fill" size={20} tintColor={colors.primary} />
            ) : (
              <Feather name="phone-call" size={20} color={colors.primary} />
            )}
            <Text style={[styles.heroActionText, { color: colors.foreground, fontFamily: theme.font.semibold }]}>Dispatch Support</Text>
          </Pressable>
          
          <Pressable
            onPress={() => Linking.openURL("mailto:support@allwaytaxi.com")}
            style={({ pressed }) => [styles.heroAction, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
          >
            {Platform.OS === "ios" ? (
              <SymbolView name="info.circle.fill" size={20} tintColor={colors.textSecondary} />
            ) : (
              <Feather name="info" size={20} color={colors.textSecondary} />
            )}
            <Text style={[styles.heroActionText, { color: colors.foreground, fontFamily: theme.font.semibold }]}>Technical Issue</Text>
          </Pressable>
        </View>

        {isOnline && (
          <StatusPanel
            realtimeConnected={realtimeConnected}
            gpsConnected={gpsConnected}
            wakeLockActive={wakeLockActive}
          />
        )}
      </ScrollView>

      <DispatchModal
        trip={pendingDispatch}
        onAccept={acceptDispatch}
        onDecline={declineDispatch}
        isProcessing={dispatchActionLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  mainShiftCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1.5,
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  shiftTimer: {
    fontSize: 36,
    letterSpacing: -1,
    marginTop: 4,
  },
  offlineText: {
    fontSize: 15,
    marginTop: 4,
    opacity: 0.6,
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  quickStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickStatText: {
    fontSize: 12,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  tripsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
  },
  radarContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 24,
  },
  radarBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radarPulse: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  radarSweep: {
    width: 70,
    height: 70,
    borderTopWidth: 4,
    borderRadius: 35,
    position: "absolute",
  },
  radarCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radarText: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  chartWrapper: {
    opacity: 0.5,
    marginTop: 12,
  },
  actionGrid: {
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 18,
  },
  heroActionText: {
    fontSize: 15,
  },
  errorCard: {
    gap: 12,
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
  },
});
