import { Feather } from "@expo/vector-icons";
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
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActiveTripCard } from "@/components/ActiveTripCard";
import { DispatchModal } from "@/components/DispatchModal";
import { PowerButton } from "@/components/PowerButton";
import { StatusPanel } from "@/components/StatusPanel";
import { TripCard } from "@/components/TripCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useAuth } from "@/contexts/AuthContext";
import { useShift } from "@/contexts/ShiftContext";
import { useColors } from "@/hooks/useColors";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 3000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.radarContainer}>
      <View style={[styles.radarBg, { borderColor: colors.textTertiary }]}>
        <Animated.View
          style={[
            styles.radarSweep,
            animatedStyle,
            { borderTopColor: colors.primary },
          ]}
        />
      </View>
      <Text style={[styles.radarText, { color: colors.textSecondary }]}>
        Scanning for trips...
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

  const firstName = driver?.full_name?.split(" ")[0] || "Driver";
  const hasActiveTrip = !!activeTrip;

  const handlePowerPress = () => {
    if (isOnline) {
      goOffline();
    } else {
      goOnline();
    }
  };

  const handleAcceptTrip = async (tripId: string) => {
    await acceptBroadcastTrip(tripId);
  };

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 + webTopPadding, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          {getGreeting()}, {firstName}
        </Text>

        <View
          style={[
            styles.shiftCard,
            {
              backgroundColor: colors.card,
              borderColor: isOnline ? colors.success : colors.cardBorder,
            },
          ]}
        >
          <View style={styles.shiftInfo}>
            <Text
              style={[
                styles.shiftStatus,
                {
                  color: isOnline
                    ? colors.success
                    : isLocating
                      ? colors.warning
                      : colors.primary,
                },
              ]}
            >
              {isOnline ? "ON SHIFT" : isLocating ? "LOCATING..." : "OFFLINE"}
            </Text>
            {isOnline && (
              <Text style={[styles.shiftTimer, { color: colors.foreground }]}>
                {shiftDisplay}
              </Text>
            )}
            {hasActiveTrip && (
              <Text style={[styles.disabledHint, { color: colors.textTertiary }]}>
                Complete trip first
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

        {isOnline && activeTrip && (
          <ActiveTripCard trip={activeTrip} onComplete={completeTrip} />
        )}

        {isOnline && !activeTrip && (
          <View>
            {availableTrips.length === 0 ? (
              <RadarSweep />
            ) : (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Available Requests ({availableTrips.length})
                </Text>
                {availableTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onAccept={handleAcceptTrip}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <WeeklyChart />

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => Linking.openURL("tel:+96170123456")}
            style={({ pressed }) => [
              styles.quickAction,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Feather name="phone-call" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.foreground }]}>
              Call Support
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("mailto:support@allwaytaxi.com")}
            style={({ pressed }) => [
              styles.quickAction,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Feather name="mail" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.foreground }]}>
              Report Issue
            </Text>
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
  greeting: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  shiftCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  shiftInfo: {
    gap: 4,
  },
  shiftStatus: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  shiftTimer: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  disabledHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  radarContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 16,
  },
  radarBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  radarSweep: {
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRadius: 20,
    position: "absolute",
  },
  radarText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
