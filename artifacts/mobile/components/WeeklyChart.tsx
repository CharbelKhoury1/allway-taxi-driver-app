import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { StateView } from "@/components/ui/StateView";
import { theme } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface DayEarning {
  label: string;
  amount: number;
  isToday: boolean;
}

export function WeeklyChart() {
  const colors = useColors();
  const { driver } = useAuth();
  const [days, setDays] = useState<DayEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driver) return;
    fetchWeeklyEarnings();
  }, [driver?.id]);

  const fetchWeeklyEarnings = async () => {
    if (!driver) return;
    setIsLoading(true);
    setError(null);
    const now = new Date();
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result: DayEarning[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      result.push({
        label: dayLabels[date.getDay()],
        amount: 0,
        isToday: i === 0,
      });
    }

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const { data, error: fetchError } = await supabase
      .from("trips")
      .select("fare_usd, completed_at")
      .eq("driver_id", driver.id)
      .eq("status", "completed")
      .gte("completed_at", weekAgo.toISOString());

    if (fetchError) {
      setError("Failed to load weekly earnings.");
      setIsLoading(false);
      return;
    }

    if (data) {
      data.forEach((trip) => {
        if (!trip.completed_at || !trip.fare_usd) return;
        const tripDate = new Date(trip.completed_at);
        const diffDays = Math.floor(
          (now.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const idx = 6 - diffDays;
        if (idx >= 0 && idx < 7) {
          result[idx].amount += Number(trip.fare_usd);
        }
      });
    }

    setDays(result);
    setIsLoading(false);
  };

  const maxAmount = Math.max(...days.map((d) => d.amount), 1);
  const hasData = days.some((d) => d.amount > 0);

  return (
    <AppCard>
      <Text style={[styles.title, { color: colors.foreground }]}>Weekly Earnings</Text>
      {isLoading ? (
        <StateView mode="loading" title="Loading earnings..." />
      ) : error ? (
        <StateView mode="error" title="Unable to load chart" description={error} onRetry={fetchWeeklyEarnings} />
      ) : !hasData ? (
        <StateView
          mode="empty"
          title="No weekly earnings yet"
          description="Completed trips will appear here."
        />
      ) : (
      <View style={styles.chart}>
        {days.map((day, i) => (
          <View key={i} style={styles.barGroup}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max((day.amount / maxAmount) * 100, 4)}%`,
                    backgroundColor: day.isToday ? colors.primary : "rgba(245,184,0,0.3)",
                    borderRadius: 4,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.dayLabel,
                {
                  color: day.isToday ? colors.primary : colors.textTertiary,
                  fontFamily: day.isToday ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.bodyLg,
    fontFamily: "Inter_600SemiBold",
    marginBottom: theme.spacing.lg,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
    height: "100%",
  },
  barContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: 20,
  },
  bar: {
    width: "100%",
    minHeight: 3,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 6,
  },
});
