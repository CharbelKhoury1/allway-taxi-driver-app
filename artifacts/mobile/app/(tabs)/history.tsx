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
      return colors.warning;
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
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("trips")
      .select("*, customers(full_name, phone, status)")
      .eq("driver_id", driver.id)
      .order("requested_at", { ascending: false })
      .limit(40);
    if (fetchError) {
      setError("Failed to load trips.");
    } else if (data) {
      setTrips(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const filteredTrips = trips.filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return t.status === "pending" || t.status === "dispatching" || t.status === "accepted" || t.status === "on_trip";
    return t.status === filter;
  });

  const totalTrips = trips.length;
  const awaitingTrips = trips.filter(
    (t) => t.status === "pending" || t.status === "dispatching" || t.status === "accepted" || t.status === "on_trip",
  ).length;
  const totalEarned = trips
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (Number(t.fare_usd) || 0), 0);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Awaiting", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 + webTopPadding }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Trip History</Text>

        <View style={styles.summaryRow}>
          <AppCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{totalTrips}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
          </AppCard>
          <AppCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>{awaitingTrips}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Awaiting</Text>
          </AppCard>
          <AppCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>${totalEarned.toFixed(0)}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Earned</Text>
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
                  backgroundColor: filter === f.value ? colors.primary : colors.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === f.value ? "#0D0D14" : colors.textSecondary,
                    fontFamily: filter === f.value ? "Inter_600SemiBold" : "Inter_400Regular",
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
        <StateView mode="loading" title="Loading trips..." />
      ) : error ? (
        <StateView
          mode="error"
          title="Could not load trip history"
          description={error}
          onRetry={() => fetchTrips()}
        />
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          scrollEnabled={filteredTrips.length > 0}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTrips(true)}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <AppCard style={styles.tripItem}>
              <View style={styles.tripHeader}>
                <Text style={[styles.tripCustomer, { color: colors.foreground }]}>
                  {item.customers?.full_name || "Customer"}
                </Text>
                <View style={styles.tripRight}>
                  <Text style={[styles.tripFare, { color: colors.primary }]}>
                    ${formatCurrency(item.fare_usd)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status, colors)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status, colors) }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.tripAddresses}>
                <TripRouteBlock
                  pickupAddress={item.pickup_address}
                  dropoffAddress={item.dropoff_address}
                  numberOfLines={1}
                />
              </View>
              <View style={styles.tripFooter}>
                {formatDistanceKm(item.distance_km) ? (
                  <Text style={[styles.tripMeta, { color: colors.textTertiary }]}>
                    {formatDistanceKm(item.distance_km)}
                  </Text>
                ) : null}
                <Text style={[styles.tripMeta, { color: colors.textTertiary }]}>
                  {getTimeAgo(item.requested_at)}
                </Text>
              </View>
            </AppCard>
          )}
          ListEmptyComponent={
            <StateView mode="empty" title="No trips found" description="Completed and pending trips appear here." />
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: "center",
    marginBottom: 0,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
  },
  tripItem: {
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tripCustomer: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  tripRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  tripFare: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
  },
  tripAddresses: {
    gap: 4,
    marginBottom: 8,
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tripMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
