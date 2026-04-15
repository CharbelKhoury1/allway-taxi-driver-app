import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !pin.trim()) {
      setError("Please enter your phone number and PIN.");
      return;
    }
    setLoading(true);
    setError("");
    const err = await login(phone.trim(), pin.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 60 }]}>
      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Feather name="truck" size={32} color="#0D0D14" />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>Allway</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Driver App
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Feather name="phone" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>PIN</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Enter your PIN"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
            />
          </View>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: "rgba(240,149,149,0.1)" }]}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.loginButton,
            {
              backgroundColor: colors.primary,
              opacity: loading ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D14" />
          ) : (
            <Text style={styles.loginText}>Sign In</Text>
          )}
        </Pressable>
      </View>

      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Add to Home Screen for the best experience
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#0D0D14",
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
