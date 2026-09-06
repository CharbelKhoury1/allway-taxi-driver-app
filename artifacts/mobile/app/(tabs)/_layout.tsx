import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";
import { isGlassAvailable } from "@/lib/glass";

const TABS = [
  {
    name: "index",
    title: "Dashboard",
    sf: { default: "square.grid.2x2", selected: "square.grid.2x2.fill" },
    feather: "grid",
  },
  {
    name: "history",
    title: "Journal",
    sf: { default: "doc.text", selected: "doc.text.fill" },
    feather: "list",
  },
  {
    name: "account",
    title: "Account",
    sf: { default: "person", selected: "person.fill" },
    feather: "user",
  },
] as const;

/**
 * Real Liquid Glass tab bar.
 *
 * This renders an actual `UITabBarController`, which is the only way to get the
 * iOS 26 glass material on a tab bar — the material, the scroll-edge transition
 * and the minimize-into-a-pill gesture are all UIKit behaviours that a
 * JavaScript tab bar cannot reproduce. Deliberately no `backgroundColor` here:
 * setting one paints over the glass and flattens it.
 */
function LiquidGlassTabs() {
  const colors = useColors();

  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={{ default: colors.textTertiary, selected: colors.primary }}
      labelStyle={{
        fontFamily: theme.font.displayBold,
        fontSize: 10,
        color: colors.textTertiary,
      }}
      minimizeBehavior="onScrollDown"
    >
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Icon sf={tab.sf} selectedColor={colors.primary} />
          <Label selectedStyle={{ color: colors.primary }}>{tab.title}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

/**
 * Fallback for iOS 18 and below, Android, web and Expo Go.
 *
 * Frosted blur rather than glass — visually close enough to keep the design
 * coherent, and it keeps the dev loop working where the native module is absent.
 */
function FallbackTabs() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: theme.font.displayBold,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#030303",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          elevation: 0,
          height: isWeb ? 84 : 88,
          paddingBottom: isIOS ? 30 : 12,
          paddingTop: 12,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : !isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#030303" }]} />
          ) : null,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? tab.sf.selected : tab.sf.default}
                  size={22}
                  tintColor={color}
                />
              ) : (
                <Feather name={tab.feather} size={22} color={color} />
              ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  return isGlassAvailable ? <LiquidGlassTabs /> : <FallbackTabs />;
}
