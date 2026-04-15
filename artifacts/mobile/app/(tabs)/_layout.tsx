import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { LayoutGrid, ClipboardList, UserRound } from "lucide-react-native";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";

export default function TabLayout() {
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
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          elevation: 0,
          height: isWeb ? 84 : 88,
          paddingBottom: isIOS ? 30 : 12,
          paddingTop: 12,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : !isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "#030303" },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            isIOS ? (
              <SymbolView
                name={focused ? "square.grid.2x2.fill" : "square.grid.2x2"}
                size={22}
                tintColor={color}
              />
            ) : (
              <LayoutGrid size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            )
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            isIOS ? (
              <SymbolView
                name={focused ? "doc.text.fill" : "doc.text"}
                size={22}
                tintColor={color}
              />
            ) : (
              <ClipboardList size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            )
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            isIOS ? (
              <SymbolView
                name={focused ? "person.fill" : "person"}
                size={22}
                tintColor={color}
              />
            ) : (
              <UserRound size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            )
          ),
        }}
      />
    </Tabs>
  );
}
