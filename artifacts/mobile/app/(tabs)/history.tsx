import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { AppCard } from "@/components/ui/AppCard";
import { GlassHeader } from "@/components/GlassHeader";
import { StateView } from "@/components/ui/StateView";
import { TripRouteBlock } from "@/components/ui/TripRouteBlock";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDistanceKm } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Trip } from "@/types";

type FilterType = "all" | "pending" | "completed" | "cancelled";

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStatusColor(status: string, colors: ReturnType<typeof useColors>) {
  switch (status) {
    case "completed":
      return colors.success;
    case "cancelled":
      return colors.destructive;
    case "pending":
    case "dispatching":
    case "accepted":
    case "on_trip":
      return colors.primary;
    default:
      return colors.textTertiary;
  }
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { driver } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [driver?.id]);

  const fetchTrips = async (isManualRefresh = false) => {
    if (!driver) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("trips")
      .select("*, customers(full_name, phone, status)")
      .eq("driver_id", driver.id)
      .order("requested_at", { ascending: false })
      .limit(40);
      
    if (fetchError) setError("Failed to load trips.");
    else if (data) setTrips(data);
    
    setLoading(false);
    setRefreshing(false);
  };

  const filteredTrips = trips.filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return ["pending", "dispatching", "accepted", "on_trip"].includes(t.status);
    return t.status === filter;
  });

  const totalTrips = trips.length;
  const totalEarned = trips.filter((t) => t.status === "completed").reduce((sum, t) => sum + (Number(t.fare_usd) || 0), 0);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <GlassHeader />
      
      <View style={[styles.header, { paddingTop: insets.top + 110 + webTopPadding }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>Activity Journal</Text>

        <View style={styles.summaryRow}>
          <AppCard variant="elevated" style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
              <Feather name="list" size={14} color={colors.textTertiary} />
            </View>
            <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
              {totalTrips}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>TOTAL TRIPS</Text>
          </AppCard>
          <AppCard variant="elevated" style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(255, 184, 0, 0.08)" }]}>
              <Feather name="trending-up" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.summaryValue, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
              ${totalEarned.toFixed(0)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>TOTAL REVENUE</Text>
          </AppCard>
        </View>

        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    filter === f.value
                      ? "rgba(255, 184, 0, 0.08)"
                      : "transparent",
                  borderColor:
                    filter === f.value
                      ? colors.primary
                      : "rgba(255, 255, 255, 0.08)",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === f.value
                        ? colors.primary
                        : colors.textSecondary,
                    fontFamily:
                      filter === f.value
                        ? theme.font.displayBold
                        : theme.font.medium,
                  },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <StateView mode="loading" title="Loading history..." />
      ) : error ? (
        <StateView mode="error" title="Failed to load" description={error} onRetry={() => fetchTrips()} />
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchTrips(true)} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <AppCard style={styles.tripItem}>
              <View style={styles.tripHeader}>
                <View style={styles.tripLeft}>
                  <View
                    style={[
                      styles.tripStatusDot,
                      { backgroundColor: getStatusColor(item.status, colors) },
                    ]}
                  />
                  <View>
                    <Text style={[styles.tripCustomer, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                      {item.customers?.full_name || "Guest Passenger"}
                    </Text>
                    <Text style={[styles.tripTime, { color: colors.textTertiary, fontFamily: theme.font.regular }]}>
                      {getTimeAgo(item.requested_at)} • {item.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tripFare, { color: item.status === "completed" ? colors.primary : colors.textSecondary, fontFamily: theme.font.displayBold }]}>
                  ${formatCurrency(item.fare_usd || 0)}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.05)" }]} />
              <TripRouteBlock pickupAddress={item.pickup_address} dropoffAddress={item.dropoff_address} numberOfLines={1} />
            </AppCard>
          )}
          ListEmptyComponent={
            <StateView mode="empty" title="No trips found" description="Completed and active trips will appear here after your first shift." />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    marginBottom: 0,
    gap: 6,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
  },
  tripItem: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 20,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tripLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  tripStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  tripCustomer: {
    fontSize: 16,
  },
  tripTime: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.6,
  },
  tripFare: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
});
