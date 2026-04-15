import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Location from "expo-location";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import type { Driver, Trip } from "@/types";

import { useAuth } from "./AuthContext";

interface ShiftContextType {
  isOnline: boolean;
  isLocating: boolean;
  shiftStartTime: number | null;
  availableTrips: Trip[];
  activeTrip: Trip | null;
  pendingDispatch: Trip | null;
  gpsConnected: boolean;
  realtimeConnected: boolean;
  wakeLockActive: boolean;
  goOnline: () => Promise<void>;
  goOffline: () => Promise<void>;
  acceptBroadcastTrip: (tripId: string) => Promise<boolean>;
  acceptDispatch: () => Promise<void>;
  declineDispatch: () => Promise<void>;
  completeTrip: () => Promise<void>;
}

const ShiftContext = createContext<ShiftContextType>({
  isOnline: false,
  isLocating: false,
  shiftStartTime: null,
  availableTrips: [],
  activeTrip: null,
  pendingDispatch: null,
  gpsConnected: false,
  realtimeConnected: false,
  wakeLockActive: false,
  goOnline: async () => {},
  goOffline: async () => {},
  acceptBroadcastTrip: async () => false,
  acceptDispatch: async () => {},
  declineDispatch: async () => {},
  completeTrip: async () => {},
});

export function useShift() {
  return useContext(ShiftContext);
}

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const { driver, updateDriver } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<number | null>(null);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [pendingDispatch, setPendingDispatch] = useState<Trip | null>(null);
  const [gpsConnected, setGpsConnected] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const selfChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );
  const pendingDispatchIdRef = useRef<string | null>(null);
  const isOnlineRef = useRef(false);
  const driverRef = useRef(driver);

  useEffect(() => {
    driverRef.current = driver;
  }, [driver]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (!driver) return;
    setupSelfChannel();
    return () => {};
  }, [driver?.id]);

  useEffect(() => {
    if (!driver) return;
    (async () => {
      const wasOnline = await AsyncStorage.getItem("_wasOnline");
      if (wasOnline === "true") {
        goOnline();
      }
    })();
  }, [driver?.id]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isOnlineRef.current && driverRef.current) {
        restartGPS();
      }
    });
    return () => sub.remove();
  }, []);

  const setupSelfChannel = useCallback(() => {
    if (!driver) return;
    if (selfChannelRef.current) {
      supabase.removeChannel(selfChannelRef.current);
    }

    const channel = supabase
      .channel(`driver-self-${driver.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `id=eq.${driver.id}`,
        },
        (payload) => {
          const updated = payload.new as Driver;
          updateDriver({
            rating: updated.rating,
            full_name: updated.full_name,
            total_trips: updated.total_trips,
            photo_url: updated.photo_url,
            car_model: updated.car_model,
            plate: updated.plate,
          });

          if (updated.online && !isOnlineRef.current) {
            goOnline();
          } else if (!updated.online && isOnlineRef.current) {
            goOffline();
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeConnected(true);
        }
      });

    selfChannelRef.current = channel;
  }, [driver?.id]);

  const startGPS = async () => {
    try {
      if (Platform.OS === "web") {
        if (navigator.geolocation) {
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              setGpsConnected(true);
              if (driverRef.current) {
                supabase
                  .from("drivers")
                  .update({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    last_seen: new Date().toISOString(),
                  })
                  .eq("id", driverRef.current.id)
                  .then(() => {});
              }
            },
            () => setGpsConnected(false),
            { enableHighAccuracy: true },
          );
          locationSubRef.current = {
            remove: () => navigator.geolocation.clearWatch(watchId),
          } as Location.LocationSubscription;
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsConnected(false);
        return;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (loc) => {
          setGpsConnected(true);
          if (driverRef.current) {
            supabase
              .from("drivers")
              .update({
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
                last_seen: new Date().toISOString(),
              })
              .eq("id", driverRef.current.id)
              .then(() => {});
          }
        },
      );
      locationSubRef.current = sub;
    } catch {
      setGpsConnected(false);
    }
  };

  const stopGPS = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
    setGpsConnected(false);
  };

  const restartGPS = async () => {
    stopGPS();
    await startGPS();
  };

  const startHeartbeat = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      if (driverRef.current) {
        supabase
          .from("drivers")
          .update({ last_seen: new Date().toISOString() })
          .eq("id", driverRef.current.id)
          .then(() => {});
      }
    }, 25000);
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      if (!driverRef.current || !isOnlineRef.current) return;
      const { data } = await supabase
        .from("trips")
        .select("*, customers(full_name, phone, status)")
        .or(
          `and(status.eq.pending,driver_id.is.null),and(status.eq.dispatching,driver_id.eq.${driverRef.current.id})`,
        );

      if (!data) return;

      const pending = data.filter(
        (t: Trip) => t.status === "pending" && !t.driver_id,
      );
      setAvailableTrips(pending);

      const dispatch = data.find(
        (t: Trip) =>
          t.status === "dispatching" &&
          t.driver_id === driverRef.current?.id,
      );
      if (dispatch && dispatch.id !== pendingDispatchIdRef.current) {
        pendingDispatchIdRef.current = dispatch.id;
        setPendingDispatch(dispatch);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }, 15000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const setupTripChannels = () => {
    if (!driver) return;

    const directChannel = supabase
      .channel(`driver-trips-${driver.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `driver_id=eq.${driver.id}`,
        },
        async (payload) => {
          const trip = payload.new as Trip;

          if (trip.status === "dispatching") {
            if (trip.id === pendingDispatchIdRef.current) return;
            const { data } = await supabase
              .from("trips")
              .select("*, customers(full_name, phone, status)")
              .eq("id", trip.id)
              .single();
            if (data) {
              pendingDispatchIdRef.current = data.id;
              setPendingDispatch(data);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
          } else if (
            trip.status === "accepted" ||
            trip.status === "on_trip"
          ) {
            const { data } = await supabase
              .from("trips")
              .select("*, customers(full_name, phone, status)")
              .eq("id", trip.id)
              .single();
            if (data) {
              setActiveTrip(data);
              setPendingDispatch(null);
              pendingDispatchIdRef.current = null;
            }
          } else if (
            trip.status === "completed" ||
            trip.status === "cancelled"
          ) {
            setActiveTrip(null);
          }
        },
      )
      .subscribe();

    const broadcastChannel = supabase
      .channel("pending-trips-broadcast")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trips",
        },
        async (payload) => {
          const trip = payload.new as Trip;
          if (trip.status === "pending" && !trip.driver_id) {
            const { data } = await supabase
              .from("trips")
              .select("*, customers(full_name, phone, status)")
              .eq("id", trip.id)
              .single();
            if (data) {
              setAvailableTrips((prev) => {
                if (prev.find((t) => t.id === data.id)) return prev;
                return [data, ...prev];
              });
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
        },
        (payload) => {
          const trip = payload.new as Trip;
          if (trip.status !== "pending" || trip.driver_id) {
            setAvailableTrips((prev) => prev.filter((t) => t.id !== trip.id));
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "trips",
        },
        (payload) => {
          const old = payload.old as { id?: string };
          if (old.id) {
            setAvailableTrips((prev) => prev.filter((t) => t.id !== old.id));
          }
        },
      )
      .subscribe();

    channelsRef.current = [directChannel, broadcastChannel];
  };

  const teardownTripChannels = () => {
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    channelsRef.current = [];
  };

  const goOnline = async () => {
    if (!driver) return;
    setIsLocating(true);

    try {
      await supabase
        .from("drivers")
        .update({
          online: true,
          status: "available",
          last_seen: new Date().toISOString(),
        })
        .eq("id", driver.id);

      try {
        await activateKeepAwakeAsync("shift");
        setWakeLockActive(true);
      } catch {
        setWakeLockActive(false);
      }

      await startGPS();
      startHeartbeat();
      setupTripChannels();
      startPolling();

      const { data: pendingTrips } = await supabase
        .from("trips")
        .select("*, customers(full_name, phone, status)")
        .eq("status", "pending")
        .is("driver_id", null);

      if (pendingTrips) {
        setAvailableTrips(pendingTrips);
      }

      const { data: activeTrips } = await supabase
        .from("trips")
        .select("*, customers(full_name, phone, status)")
        .eq("driver_id", driver.id)
        .in("status", ["accepted", "on_trip"])
        .limit(1);

      if (activeTrips && activeTrips.length > 0) {
        setActiveTrip(activeTrips[0]);
      }

      setIsOnline(true);
      setIsLocating(false);
      setShiftStartTime(Date.now());
      await AsyncStorage.setItem("_wasOnline", "true");
      updateDriver({ online: true, status: "available" });
    } catch {
      setIsLocating(false);
    }
  };

  const goOffline = async () => {
    if (!driver) return;

    stopGPS();
    stopHeartbeat();
    stopPolling();
    teardownTripChannels();

    try {
      deactivateKeepAwake("shift");
    } catch {}
    setWakeLockActive(false);

    await supabase
      .from("drivers")
      .update({ online: false, status: "offline" })
      .eq("id", driver.id);

    setIsOnline(false);
    setShiftStartTime(null);
    setAvailableTrips([]);
    setActiveTrip(null);
    setPendingDispatch(null);
    pendingDispatchIdRef.current = null;
    await AsyncStorage.setItem("_wasOnline", "false");
    updateDriver({ online: false, status: "offline" });
  };

  const acceptBroadcastTrip = async (tripId: string): Promise<boolean> => {
    if (!driver) return false;

    const { data } = await supabase
      .from("trips")
      .update({
        driver_id: driver.id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", tripId)
      .is("driver_id", null)
      .select("*, customers(full_name, phone, status)");

    if (!data || data.length === 0) {
      setAvailableTrips((prev) => prev.filter((t) => t.id !== tripId));
      return false;
    }

    await supabase
      .from("drivers")
      .update({ status: "on_trip" })
      .eq("id", driver.id);

    setActiveTrip(data[0]);
    setAvailableTrips([]);
    updateDriver({ status: "on_trip" });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    return true;
  };

  const acceptDispatch = async () => {
    if (!driver || !pendingDispatch) return;

    await supabase
      .from("trips")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", pendingDispatch.id);

    await supabase
      .from("drivers")
      .update({ status: "on_trip" })
      .eq("id", driver.id);

    setActiveTrip(pendingDispatch);
    setPendingDispatch(null);
    pendingDispatchIdRef.current = null;
    setAvailableTrips([]);
    updateDriver({ status: "on_trip" });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const declineDispatch = async () => {
    if (!driver || !pendingDispatch) return;

    await supabase
      .from("trips")
      .update({
        driver_id: null,
        status: "pending",
      })
      .eq("id", pendingDispatch.id);

    await supabase
      .from("drivers")
      .update({ status: "available" })
      .eq("id", driver.id);

    setPendingDispatch(null);
    pendingDispatchIdRef.current = null;
    updateDriver({ status: "available" });
  };

  const completeTrip = async () => {
    if (!driver || !activeTrip) return;

    await supabase
      .from("trips")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", activeTrip.id);

    await supabase
      .from("drivers")
      .update({ status: "available" })
      .eq("id", driver.id);

    setActiveTrip(null);
    updateDriver({ status: "available" });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <ShiftContext.Provider
      value={{
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
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}
