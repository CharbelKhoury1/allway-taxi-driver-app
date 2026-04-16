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
  Image,
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
import { GlassHeader } from "@/components/GlassHeader";
import { GlassEffectContainer } from "@/components/ui/GlassEffectContainer";

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
  const [refreshing, setRefreshing] = useState(false);
  const [navPreference, setNavPreference] = useState("google"); // google, apple, waze

  useEffect(() => {
    fetchEarnings();
  }, [driver?.id]);

  const fetchEarnings = async (isManualRefresh = false) => {
    if (!driver) return;
    if (isManualRefresh) setRefreshing(true);
    else setEarningsLoading(true);
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
    ? driver.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <GlassHeader />
      
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 110 + webTopPadding, paddingBottom: 150 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchEarnings(true)} tintColor={colors.primary} />
        }
      >
        <View style={styles.profileHero}>
          <View style={[styles.avatarWrapper, { borderColor: colors.cardBorder }]}>
            {driver.photo_url ? (
              <Image source={{ uri: driver.photo_url }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={[colors.primary, "#FFD700"]}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.avatarText, { fontFamily: theme.font.displayBold }]}>{initials}</Text>
              </LinearGradient>
            )}
          </View>
          
          <Text style={[styles.name, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
            {driver.full_name}
          </Text>
          
          <View style={styles.carInfoRow}>
            <View style={[styles.carBadge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
              <Feather name="truck" size={12} color={colors.textTertiary} />
              <Text style={[styles.carInfo, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>
                {driver.car_model}
              </Text>
            </View>
            <View style={[styles.carBadge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
              <Text style={[styles.plateText, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                {driver.plate}
              </Text>
            </View>
          </View>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
              <Feather name="star" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.foreground, fontFamily: theme.font.semibold }]}>
                {Number(driver.rating || 4.95).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
              <Feather name="award" size={12} color={colors.success} />
              <Text style={[styles.badgeText, { color: colors.foreground, fontFamily: theme.font.semibold }]}>
                Elite Tier
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
              { label: "TODAY", data: earnings.today, icon: "calendar" },
              { label: "WEEK", data: earnings.week, icon: "activity" },
              { label: "MONTH", data: earnings.month, icon: "bar-chart-2" },
            ].map((item) => (
              <AppCard key={item.label} style={styles.earningsCard}>
                <View style={[styles.earningsIcon, { backgroundColor: "rgba(255, 184, 0, 0.1)" }]}>
                  <Feather name={item.icon as any} size={10} color={colors.primary} />
                </View>
                <Text style={[styles.earningsAmount, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                  ${item.data.amount.toFixed(0)}
                </Text>
                <Text style={[styles.earningsTripCount, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>
                  {item.data.trips} jobs
                </Text>
                <Text style={[styles.earningsLabel, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
                  {item.label}
                </Text>
              </AppCard>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>
          SECURITY
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
              <Feather name="shield" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.menuItemLabel, { color: colors.foreground, fontFamily: theme.font.semibold }]}>
                Security PIN
              </Text>
              <Text style={[styles.menuItemSublabel, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>
                Update your driver access code
              </Text>
            </View>
          </View>
          <Feather name={showPinForm ? "chevron-up" : "chevron-down"} size={18} color={colors.textTertiary} />
        </Pressable>

        {showPinForm && (
          <View style={styles.pinFormWrapper}>
            <AppCard style={styles.pinForm}>
              <View style={styles.pinInput}>
                <Text style={[styles.pinLabel, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>CURRENT PIN</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.foreground, backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: colors.cardBorder }]}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                  value={currentPin}
                  onChangeText={setCurrentPin}
                  placeholderTextColor={colors.textTertiary}
                  placeholder="••••"
                />
              </View>
              <View style={styles.pinInput}>
                <Text style={[styles.pinLabel, { color: colors.textSecondary, fontFamily: theme.font.medium }]}>NEW PIN</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.foreground, backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: colors.cardBorder }]}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                  value={newPin}
                  onChangeText={setNewPin}
                  placeholderTextColor={colors.textTertiary}
                  placeholder="••••"
                />
              </View>
              {pinError ? <Text style={[styles.pinError, { color: colors.destructive }]}>{pinError}</Text> : null}
              <AppButton 
                label="Update Security PIN" 
                onPress={handleChangePin} 
                loading={pinLoading} 
                disabled={pinLoading} 
                variant="glassProminent"
                height={56}
              />
            </AppCard>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>
          PREFERENCES
        </Text>

        <AppCard style={styles.preferencesCard}>
          <View style={styles.prefHeader}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(0, 122, 255, 0.1)" }]}>
              <Feather name="navigation" size={18} color="#007AFF" />
            </View>
            <View>
              <Text style={[styles.prefTitle, { color: colors.foreground, fontFamily: theme.font.semibold }]}>
                Navigation App
              </Text>
              <Text style={[styles.prefSubtitle, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>
                Preferred app for trip routing
              </Text>
            </View>
          </View>
          
          <View style={styles.navOptions}>
            {[
              { id: "google", label: "Google Maps" },
              { id: "waze", label: "Waze" },
              { id: "apple", label: "Apple Maps" },
            ].map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => setNavPreference(opt.id)}
                style={[
                  styles.navOption,
                  { 
                    backgroundColor: navPreference === opt.id ? "rgba(255, 184, 0, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: navPreference === opt.id ? colors.primary : "transparent"
                  }
                ]}
              >
                <Text style={[
                  styles.navOptionText, 
                  { 
                    color: navPreference === opt.id ? colors.primary : colors.textSecondary,
                    fontFamily: navPreference === opt.id ? theme.font.displayBold : theme.font.medium 
                  }
                ]}>
                  {opt.label}
                </Text>
                {navPreference === opt.id && <Feather name="check" size={14} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </AppCard>

        <View style={styles.footerActions}>
          <AppButton
            label="Secure Logout"
            onPress={handleLogout}
            icon={<Feather name="power" size={18} color={colors.foreground} />}
            variant="glass"
            height={60}
          />
        </View>
      </ScrollView>
    </View>
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
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    padding: 3,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 42,
  },
  avatarText: {
    fontSize: 28,
    color: "#030303",
  },
  name: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  carInfoRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  carBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  carInfo: {
    fontSize: 13,
  },
  plateText: {
    fontSize: 13,
    letterSpacing: 1,
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
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  earningsIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  earningsTripCount: {
    fontSize: 10,
    opacity: 0.7,
  },
  earningsLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    fontSize: 16,
  },
  menuItemSublabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 1,
  },
  pinFormWrapper: {
    marginBottom: 24,
  },
  pinForm: {
    padding: 24,
    gap: 20,
    borderRadius: 24,
  },
  pinInput: {
    gap: 10,
  },
  pinLabel: {
    fontSize: 10,
    letterSpacing: 1,
    opacity: 0.5,
  },
  textInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 4,
  },
  pinError: {
    fontSize: 13,
    textAlign: "center",
  },
  preferencesCard: {
    padding: 24,
    gap: 20,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  prefHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  prefTitle: {
    fontSize: 16,
  },
  prefSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  navOptions: {
    gap: 10,
  },
  navOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  navOptionText: {
    fontSize: 14,
  },
  footerActions: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 40,
  },
});
