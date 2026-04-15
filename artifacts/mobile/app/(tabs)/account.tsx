import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useShift } from "@/contexts/ShiftContext";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/lib/supabase";

interface EarningsPeriod {
  amount: number;
  trips: number;
}

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { driver, logout, updateDriver } = useAuth();
  const { isOnline, goOffline } = useShift();
  const [earnings, setEarnings] = useState<{
    today: EarningsPeriod;
    week: EarningsPeriod;
    month: EarningsPeriod;
  }>({
    today: { amount: 0, trips: 0 },
    week: { amount: 0, trips: 0 },
    month: { amount: 0, trips: 0 },
  });

  const [showPinForm, setShowPinForm] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [driver?.id]);

  const fetchEarnings = async () => {
    if (!driver) return;
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() - 30);

    const { data } = await supabase
      .from("trips")
      .select("fare_usd, completed_at")
      .eq("driver_id", driver.id)
      .eq("status", "completed")
      .gte("completed_at", monthStart.toISOString());

    if (!data) return;

    const result = {
      today: { amount: 0, trips: 0 },
      week: { amount: 0, trips: 0 },
      month: { amount: 0, trips: 0 },
    };

    data.forEach((trip) => {
      const fare = Number(trip.fare_usd) || 0;
      const completedAt = new Date(trip.completed_at);

      result.month.amount += fare;
      result.month.trips += 1;

      if (completedAt >= weekStart) {
        result.week.amount += fare;
        result.week.trips += 1;
      }
      if (completedAt >= todayStart) {
        result.today.amount += fare;
        result.today.trips += 1;
      }
    });

    setEarnings(result);
  };

  const handleChangePin = async () => {
    if (!driver) return;
    if (currentPin !== driver.pwa_pin) {
      setPinError("Current PIN is incorrect.");
      return;
    }
    if (newPin.length < 4 || newPin.length > 6) {
      setPinError("New PIN must be 4-6 digits.");
      return;
    }

    setPinLoading(true);
    setPinError("");
    const { error } = await supabase
      .from("drivers")
      .update({ pwa_pin: newPin })
      .eq("id", driver.id);

    setPinLoading(false);
    if (error) {
      setPinError("Failed to update PIN.");
    } else {
      updateDriver({ pwa_pin: newPin });
      setShowPinForm(false);
      setCurrentPin("");
      setNewPin("");
    }
  };

  const handleLogout = async () => {
    if (isOnline) {
      await goOffline();
    }
    await logout();
    router.replace("/login");
  };

  if (!driver) return null;

  const initials = driver.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16 + webTopPadding, paddingBottom: 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHero}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {driver.full_name}
        </Text>
        <Text style={[styles.carInfo, { color: colors.textSecondary }]}>
          {driver.car_model} - {driver.plate}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Feather name="star" size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.foreground }]}>
              {Number(driver.rating || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Feather name="map" size={12} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.foreground }]}>
              {driver.total_trips || 0} trips
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Earnings
      </Text>
      <View style={styles.earningsRow}>
        {[
          { label: "Today", data: earnings.today },
          { label: "7 Days", data: earnings.week },
          { label: "30 Days", data: earnings.month },
        ].map((item) => (
          <View
            key={item.label}
            style={[
              styles.earningsCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.earningsAmount, { color: colors.primary }]}>
              ${item.data.amount.toFixed(0)}
            </Text>
            <Text style={[styles.earningsTripCount, { color: colors.textSecondary }]}>
              {item.data.trips} trips
            </Text>
            <Text style={[styles.earningsLabel, { color: colors.textTertiary }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Vehicle Details
      </Text>
      <View
        style={[
          styles.detailsCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        {[
          { label: "Car Model", value: driver.car_model },
          { label: "Plate Number", value: driver.plate },
          { label: "All-time Trips", value: String(driver.total_trips || 0) },
          { label: "Star Rating", value: Number(driver.rating || 0).toFixed(2) },
        ].map((item, i) => (
          <View key={item.label}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {item.value}
              </Text>
            </View>
            {i < 3 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => setShowPinForm(!showPinForm)}
        style={[
          styles.changePinToggle,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.changePinRow}>
          <Feather name="lock" size={18} color={colors.textSecondary} />
          <Text style={[styles.changePinLabel, { color: colors.foreground }]}>
            Change PIN
          </Text>
        </View>
        <Feather
          name={showPinForm ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textTertiary}
        />
      </Pressable>

      {showPinForm && (
        <View style={[styles.pinForm, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.pinInput}>
            <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>Current PIN</Text>
            <TextInput
              style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={currentPin}
              onChangeText={setCurrentPin}
              placeholderTextColor={colors.textTertiary}
              placeholder="Enter current PIN"
            />
          </View>
          <View style={styles.pinInput}>
            <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>New PIN</Text>
            <TextInput
              style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={newPin}
              onChangeText={setNewPin}
              placeholderTextColor={colors.textTertiary}
              placeholder="Enter new PIN (4-6 digits)"
            />
          </View>
          {pinError ? (
            <Text style={[styles.pinError, { color: colors.destructive }]}>{pinError}</Text>
          ) : null}
          <Pressable
            onPress={handleChangePin}
            disabled={pinLoading}
            style={({ pressed }) => [
              styles.pinSubmit,
              { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            {pinLoading ? (
              <ActivityIndicator color="#0D0D14" />
            ) : (
              <Text style={styles.pinSubmitText}>Update PIN</Text>
            )}
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            borderColor: colors.destructive,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>
          Log Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  profileHero: {
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#0D0D14",
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  carInfo: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  badges: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  earningsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  earningsAmount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  earningsTripCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  earningsLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  detailsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
  },
  changePinToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  changePinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  changePinLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  pinForm: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  pinInput: {
    gap: 4,
  },
  pinLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  pinError: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  pinSubmit: {
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pinSubmitText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#0D0D14",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
