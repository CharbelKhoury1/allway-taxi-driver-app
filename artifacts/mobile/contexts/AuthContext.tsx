import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { Driver } from "@/types";

interface AuthContextType {
  driver: Driver | null;
  isLoading: boolean;
  login: (phone: string, pin: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateDriver: (updates: Partial<Driver>) => void;
}

const AuthContext = createContext<AuthContextType>({
  driver: null,
  isLoading: true,
  login: async () => null,
  logout: async () => {},
  updateDriver: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("driver_session");
        if (stored) {
          setDriver(JSON.parse(stored));
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (phone: string, pin: string): Promise<string | null> => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
      const client = createClient(url, key);

      const { data, error } = await client
        .from("drivers")
        .select("*")
        .ilike("phone", `%${phone}%`)
        .eq("pwa_pin", pin)
        .single();

      if (error || !data) {
        return "Incorrect phone number or PIN.";
      }

      const driverData = data as Driver;
      setDriver(driverData);
      await AsyncStorage.setItem("driver_session", JSON.stringify(driverData));
      await AsyncStorage.setItem("_wasOnline", "false");
      return null;
    } catch {
      return "Connection error. Please try again.";
    }
  };

  const logout = async () => {
    setDriver(null);
    await AsyncStorage.removeItem("driver_session");
    await AsyncStorage.removeItem("_wasOnline");
  };

  const updateDriver = (updates: Partial<Driver>) => {
    setDriver((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("driver_session", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ driver, isLoading, login, logout, updateDriver }}
    >
      {children}
    </AuthContext.Provider>
  );
}
