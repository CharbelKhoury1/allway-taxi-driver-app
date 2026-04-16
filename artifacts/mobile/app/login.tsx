import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { AppButton } from "@/components/ui/AppButton";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { normalizePhone } from "@/lib/auth";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleLogin = async () => {
    const now = Date.now();
    if (lockedUntil && now < lockedUntil) {
      const waitSec = Math.ceil((lockedUntil - now) / 1000);
      setError(`Access locked. Retry in ${waitSec}s.`);
      return;
    }

    if (!phone.trim() || !pin.trim()) {
      setError("Credentials required.");
      return;
    }
    setLoading(true);
    setError("");
    const err = await login(normalizePhone(phone.trim()), pin.trim());
    setLoading(false);
    if (err) {
      const nextAttempts = attemptCount + 1;
      setAttemptCount(nextAttempts);
      if (nextAttempts >= 5) {
        const lockMs = 30000;
        setLockedUntil(Date.now() + lockMs);
        setError("Too many fails. Cooldown: 30s.");
      } else {
        setError(err);
      }
    } else {
      setAttemptCount(0);
      setLockedUntil(null);
      router.replace("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={["#0D0D14", "#030303", "#000000"]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative Glow Elements */}
      <View style={[styles.glow, { top: -50, right: -50, backgroundColor: colors.primary, opacity: 0.15 }]} />
      <View style={[styles.glow, { bottom: -100, left: -50, backgroundColor: "#1e3a8a", opacity: 0.1 }]} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "ios" ? 80 : 40),
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={["rgba(245, 184, 0, 0.28)", "rgba(245, 184, 0, 0.08)"]}
            style={styles.logoWrapper}
          >
            <View style={styles.logoInner}>
              <Text style={[styles.logoText, { color: colors.primary, fontFamily: theme.font.displayBold }]}>W</Text>
            </View>
          </LinearGradient>
          <Text style={[styles.appName, { color: colors.foreground, fontFamily: theme.font.displayBold }]}>
            ALLWAY <Text style={{ color: colors.primary }}>TAXI</Text>
          </Text>
          <Text style={[styles.tagline, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>
            SECURE DRIVER GATEWAY
          </Text>
        </View>

        <BlurView intensity={25} tint="dark" style={[styles.glassCard, { borderColor: "rgba(255, 255, 255, 0.1)" }]}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>IDENTIFICATION</Text>
              <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: "rgba(255, 255, 255, 0.06)" }]}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="phone.fill" size={18} tintColor={colors.textTertiary} />
                ) : (
                  <Feather name="phone" size={18} color={colors.textTertiary} />
                )}
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: theme.font.medium }]}
                  placeholder="Phone Number"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textTertiary, fontFamily: theme.font.displayBold }]}>SECURITY PIN</Text>
              <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: "rgba(255, 255, 255, 0.06)" }]}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="lock.fill" size={18} tintColor={colors.textTertiary} />
                ) : (
                  <Feather name="lock" size={18} color={colors.textTertiary} />
                )}
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: theme.font.medium }]}
                  placeholder="6-Digit PIN"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={6}
                  value={pin}
                  onChangeText={setPin}
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: "rgba(240, 82, 82, 0.05)", borderColor: "rgba(240, 82, 82, 0.15)" }]}>
                {Platform.OS === "ios" ? (
                  <SymbolView name="exclamationmark.triangle.fill" size={14} tintColor={colors.destructive} />
                ) : (
                  <Feather name="alert-circle" size={14} color={colors.destructive} />
                )}
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: theme.font.medium }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.actionContainer}>
              <AppButton
                label="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                icon={
                  Platform.OS === "ios" ? (
                    <SymbolView name="arrow.right" size={18} tintColor="#030303" />
                  ) : (
                    <Feather name="arrow-right" size={18} color="#030303" />
                  )
                }
                variant="primary"
              />
            </View>
          </View>
        </BlurView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary, fontFamily: theme.font.medium }]}>
            Secure Hub v4.8 • Regional Access Only
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  container: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrapper: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(245, 184, 0, 0.22)",
  },
  logoInner: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 38,
    letterSpacing: -5,
    transform: [{ skewX: "-10deg" }],
  },
  appName: {
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 3,
    opacity: 0.6,
  },
  glassCard: {
    width: "100%",
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    padding: 30,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
  },
  actionContainer: {
    marginTop: 8,
  },
  footer: {
    marginTop: 40,
    opacity: 0.4,
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
