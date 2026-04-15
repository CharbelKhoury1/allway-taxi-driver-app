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
          { paddingTop: insets.top + 110 + webTopPadding, paddingBottom: 150 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AppCard
          style={[
            styles.mainShiftCard,
            {
              backgroundColor: isOnline ? "transparent" : "rgba(255, 255, 255, 0.02)",
              borderColor: isOnline ? "rgba(255, 184, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
              ...theme.shadows.soft,
            },
          ]}
        >
          <View style={styles.shiftHeader}>
            <View style={styles.shiftInfo}>
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
                  <SymbolView name="bolt.fill" size={12} tintColor={colors.primary} />
                ) : (
                  <Feather name="zap" size={12} color={colors.primary} />
                )}
                <Text style={[styles.quickStatText, { color: colors.textSecondary, fontFamily: theme.font.displayBold }]}>HOT AREA</Text>
              </View>
              <View style={styles.statDot} />
              <View style={styles.quickStatItem}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="shield.fill" size={12} tintColor={colors.success} />
                ) : (
                  <Feather name="shield" size={12} color={colors.success} />
                )}
                <Text style={[styles.quickStatText, { color: colors.textSecondary, fontFamily: theme.font.displayBold }]}>SECURE</Text>
              </View>
            </View>
          )}
        </AppCard>

        {isOnline && activeTrip && (
          <View style={styles.section}>
            <ActiveTripCard trip={activeTrip} onComplete={completeTrip} />
          </View>
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
          <View style={[styles.section, { opacity: 0.6 }]}>
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
            style={({ pressed }) => [styles.heroAction, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={styles.heroActionIcon}>
              {Platform.OS === "ios" ? (
                <SymbolView name="phone.fill" size={20} tintColor={colors.primary} />
              ) : (
                <Feather name="phone-call" size={20} color={colors.primary} />
              )}
            </View>
            <View>
              <Text style={[styles.heroActionTitle, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>DISPATCH SUPPORT</Text>
              <Text style={[styles.heroActionSubtitle, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>Contact operational HQ</Text>
            </View>
          </Pressable>
          
          <Pressable
            onPress={() => Linking.openURL("mailto:support@allwaytaxi.com")}
            style={({ pressed }) => [styles.heroAction, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.textSecondary, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={styles.heroActionIcon}>
              {Platform.OS === "ios" ? (
                <SymbolView name="info.circle.fill" size={20} tintColor={colors.textSecondary} />
              ) : (
                <Feather name="info" size={20} color={colors.textSecondary} />
              )}
            </View>
            <View>
              <Text style={[styles.heroActionTitle, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>TECHNICAL ISSUE</Text>
              <Text style={[styles.heroActionSubtitle, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>Report a system bug</Text>
            </View>
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
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 20,
  },
  mainShiftCard: {
    borderRadius: 32,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1,
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shiftInfo: {
    gap: 4,
  },
  statusLabel: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    opacity: 0.9,
  },
  shiftTimer: {
    fontSize: 42,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  offlineText: {
    fontSize: 16,
    opacity: 0.6,
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  quickStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickStatText: {
    fontSize: 10,
    letterSpacing: 1,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  tripsSection: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 14,
  },
  radarContainer: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 28,
  },
  radarBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radarPulse: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  radarSweep: {
    width: 80,
    height: 80,
    borderTopWidth: 5,
    borderRadius: 40,
    position: "absolute",
  },
  radarCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radarText: {
    fontSize: 14,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  actionGrid: {
    gap: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 22,
    borderRadius: 24,
  },
  heroActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroActionTitle: {
    fontSize: 14,
    letterSpacing: 1,
  },
  heroActionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.4,
  },
  errorCard: {
    gap: 16,
    marginTop: 20,
    padding: 24,
  },
  errorText: {
    fontSize: 14,
  },
});
