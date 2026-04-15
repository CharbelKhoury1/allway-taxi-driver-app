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
  const awaitingTrips = trips.filter((t) => ["pending", "dispatching", "accepted", "on_trip"].includes(t.status)).length;
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
      <View style={[styles.header, { paddingTop: insets.top + 24 + webTopPadding }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>Activity</Text>

        <View style={styles.summaryRow}>
          <AppCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>{totalTrips}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>TRIPS</Text>
          </AppCard>
          <AppCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.primary, fontFamily: theme.font.displayBold }]}>${totalEarned.toFixed(0)}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>EARNED</Text>
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
                  backgroundColor: filter === f.value ? colors.primary : colors.card,
                  borderColor: filter === f.value ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === f.value ? "#030303" : colors.textSecondary,
                    fontFamily: filter === f.value ? theme.font.displayBold : theme.font.medium,
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
                <View>
                  <Text style={[styles.tripCustomer, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
                    {item.customers?.full_name || "Guest"}
                  </Text>
                  <Text style={[styles.tripTime, { color: colors.textTertiary, fontFamily: theme.font.regular }]}>
                    {getTimeAgo(item.requested_at)}
                  </Text>
                </View>
                <View style={styles.tripRight}>
                  <Text style={[styles.tripFare, { color: colors.primary, fontFamily: theme.font.displayBold }]}>
                    ${formatCurrency(item.fare_usd || 0)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status, colors), fontFamily: theme.font.bold }]}>
                      {item.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <TripRouteBlock pickupAddress={item.pickup_address} dropoffAddress={item.dropoff_address} numberOfLines={1} />
            </AppCard>
          )}
          ListEmptyComponent={
            <StateView mode="empty" title="No trips found" description="Awaiting is empty." />
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
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    marginBottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  summaryValue: {
    fontSize: 24,
  },
  summaryLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
  },
  tripItem: {
    padding: 16,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tripCustomer: {
    fontSize: 16,
  },
  tripTime: {
    fontSize: 12,
    marginTop: 2,
  },
  tripRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  tripFare: {
    fontSize: 18,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
  },
});
