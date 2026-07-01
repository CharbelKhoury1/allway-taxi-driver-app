import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { maskDriverSessionPin, normalizePhone, stripPhoneToDigits } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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
      const normalizedPhone = normalizePhone(phone);
      const normalizedDigits = stripPhoneToDigits(normalizedPhone);
      if (!normalizedDigits || pin.length < 4) {
        return "Enter a valid phone number and PIN.";
      }

      // Query by PIN only to find candidates, then match phone client-side.
      // We intentionally use the shared singleton client (not a new one per login).
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("pwa_pin", pin)
        .limit(30);

      if (error || !data || data.length === 0) {
        return "Incorrect phone number or PIN.";
      }

      const matched = data.find((candidate) => {
        const storedDigits = stripPhoneToDigits(String(candidate.phone || ""));
        return storedDigits === normalizedDigits;
      });

      if (!matched) {
        return "Incorrect phone number or PIN.";
      }

      // Mask the PIN before storing in React state and on disk.
      const driverData = maskDriverSessionPin(matched as Driver);
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
      AsyncStorage.setItem(
        "driver_session",
        JSON.stringify(maskDriverSessionPin(updated)),
      );
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
