import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StateView } from "@/components/ui/StateView";
import { theme } from "@/constants/theme";
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
  const { driver, logout } = useAuth();
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
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [driver?.id]);

  const fetchEarnings = async (isManualRefresh = false) => {
    if (!driver) return;
    if (isManualRefresh) setRefreshing(true);
    else setEarningsLoading(true);
    setEarningsError(null);
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() - 30);

    const { data, error } = await supabase
      .from("trips")
      .select("fare_usd, completed_at")
      .eq("driver_id", driver.id)
      .eq("status", "completed")
      .gte("completed_at", monthStart.toISOString());

    if (error || !data) {
      setEarningsError("Failed to load earnings.");
      setEarningsLoading(false);
      setRefreshing(false);
      return;
    }

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
    setEarningsLoading(false);
    setRefreshing(false);
  };

  const handleChangePin = async () => {
    if (!driver) return;
    if (!/^\d{4,6}$/.test(currentPin)) {
      setPinError("Current PIN must be 4-6 digits.");
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
      setShowPinForm(false);
      setCurrentPin("");
      setNewPin("");
    }
  };

  const handleLogout = async () => {
    if (isOnline) await goOffline();
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
        { paddingTop: insets.top + 24 + webTopPadding, paddingBottom: 150 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchEarnings(true)} tintColor={colors.primary} />
      }
    >
      <View style={styles.profileHero}>
        <LinearGradient
          colors={[colors.primary, "#FFD700"]}
          style={styles.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.avatarText, { fontFamily: theme.font.displayBold }]}>{initials}</Text>
        </LinearGradient>
        <Text style={[styles.name, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
          {driver.full_name}
        </Text>
        <Text style={[styles.carInfo, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>
          {driver.car_model} • {driver.plate}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
            <Feather name="star" size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.foreground, fontFamily: theme.font.semibold }]}>
              {Number(driver.rating || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
            <Feather name="trending-up" size={12} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.foreground, fontFamily: theme.font.semibold }]}>
              Elite Status
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>
        PERFORMANCE
      </Text>
      
      {earningsLoading ? (
        <StateView mode="loading" title="Analyzing earnings..." />
      ) : (
        <View style={styles.earningsRow}>
          {[
            { label: "TODAY", data: earnings.today },
            { label: "WEEK", data: earnings.week },
            { label: "MONTH", data: earnings.month },
          ].map((item) => (
            <AppCard key={item.label} style={styles.earningsCard}>
              <Text style={[styles.earningsAmount, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
                ${item.data.amount.toFixed(0)}
              </Text>
              <Text style={[styles.earningsTripCount, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>
                {item.data.trips} trips
              </Text>
              <Text style={[styles.earningsLabel, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>
                {item.label}
              </Text>
            </AppCard>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>
        MANAGEMENT
      </Text>
      
      <Pressable
        onPress={() => setShowPinForm(!showPinForm)}
        style={[
          styles.menuItem,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.menuItemRow}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(245, 184, 0, 0.1)" }]}>
            <Feather name="lock" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.menuItemLabel, { color: colors.foreground, fontFamily: theme.font.semibold }]}>
            Change Security PIN
          </Text>
        </View>
        <Feather name={showPinForm ? "chevron-up" : "chevron-down"} size={18} color={colors.textTertiary} />
      </Pressable>

      {showPinForm && (
        <AppCard style={styles.pinForm}>
          <View style={styles.pinInput}>
            <Text style={[styles.pinLabel, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>Current PIN</Text>
            <TextInput
              style={[styles.textInput, { color: colors.foreground, backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: colors.cardBorder }]}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={currentPin}
              onChangeText={setCurrentPin}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={styles.pinInput}>
            <Text style={[styles.pinLabel, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>New PIN</Text>
            <TextInput
              style={[styles.textInput, { color: colors.foreground, backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: colors.cardBorder }]}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={newPin}
              onChangeText={setNewPin}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          {pinError ? <Text style={[styles.pinError, { color: colors.destructive }]}>{pinError}</Text> : null}
          <AppButton label="Confirm Changes" onPress={handleChangePin} loading={pinLoading} disabled={pinLoading} />
        </AppCard>
      )}

      <View style={styles.footerActions}>
        <AppButton
          label="Secure Logout"
          onPress={handleLogout}
          icon={<Feather name="power" size={18} color={colors.destructive} />}
          variant="ghost"
        />
      </View>
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
    marginBottom: 32,
    gap: 8,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    color: "#030303",
  },
  name: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  carInfo: {
    fontSize: 15,
    opacity: 0.8,
  },
  badges: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 4,
  },
  earningsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  earningsCard: {
    flex: 1,
    marginBottom: 0,
    padding: 16,
    alignItems: "flex-start",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  earningsAmount: {
    fontSize: 22,
  },
  earningsTripCount: {
    fontSize: 11,
  },
  earningsLabel: {
    fontSize: 9,
    letterSpacing: 1,
    opacity: 0.6,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    fontSize: 15,
  },
  pinForm: {
    marginBottom: 20,
    padding: 20,
    gap: 16,
  },
  pinInput: {
    gap: 8,
  },
  pinLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  pinError: {
    fontSize: 13,
  },
  footerActions: {
    marginTop: 40,
    alignItems: "center",
  },
});
