import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.glowTop, { backgroundColor: colors.primary }]} />
      <View style={[styles.glowBottom, { backgroundColor: colors.success }]} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 44 : 20),
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.logoSection}>
            <View style={[styles.logoHalo, { borderColor: `${colors.primary}55` }]}>
              <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                <Feather name="truck" size={30} color="#0D0D14" />
              </View>
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>Allway</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Driver App</Text>
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
                  returnKeyType="next"
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
                  onSubmitEditing={handleLogin}
                  returnKeyType="done"
                />
              </View>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: "rgba(240,149,149,0.12)", borderColor: "rgba(240,149,149,0.28)" }]}> 
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
                <View style={styles.loginContent}>
                  <Text style={styles.loginText}>Sign In</Text>
                  <Feather name="arrow-right" size={18} color="#0D0D14" />
                </View>
              )}
            </Pressable>
          </View>

          <View style={[styles.helperPanel, { backgroundColor: "rgba(245,184,0,0.08)", borderColor: "rgba(245,184,0,0.18)" }]}> 
            <Feather name="smartphone" size={15} color={colors.primary} />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Add to Home Screen for the best experience</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.18,
  },
  glowBottom: {
    position: "absolute",
    bottom: -150,
    left: -130,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.09,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    gap: 22,
  },
  logoSection: {
    alignItems: "center",
    gap: 6,
  },
  logoHalo: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 54,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  loginButton: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  loginContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#0D0D14",
  },
  helperPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    flexShrink: 1,
  },
});
