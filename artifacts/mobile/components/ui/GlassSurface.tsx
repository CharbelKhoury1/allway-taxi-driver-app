import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";

import { GlassView, isGlassAvailable, type GlassStyle } from "@/lib/glass";

export interface GlassSurfaceProps extends ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /**
   * `regular` adapts to the content behind it, `clear` is more transparent and
   * is meant for surfaces sitting over rich imagery or media.
   */
  glassEffectStyle?: GlassStyle;
  /** Optional colour wash applied to the material. Use sparingly. */
  tintColor?: string;
  /** Lets the material react to touches with a specular highlight. */
  isInteractive?: boolean;
  /** Blur strength used only on the pre-iOS-26 fallback path. */
  fallbackIntensity?: number;
  /**
   * Draws the hairline border and translucent fill used to fake depth on the
   * fallback path. Always disabled under real Liquid Glass, which supplies its
   * own specular edge — painting over it is what makes the material look flat.
   */
  fallbackBordered?: boolean;
}

/**
 * A single surface that renders real Liquid Glass where the platform supports it
 * and degrades to a frosted blur (iOS < 26) or a solid fill (Android/web).
 *
 * Prefer this over reaching for `BlurView` directly so the whole app upgrades in
 * one place once it runs on an iOS 26 build.
 */
export function GlassSurface({
  children,
  style,
  glassEffectStyle = "regular",
  tintColor,
  isInteractive = false,
  fallbackIntensity = 50,
  fallbackBordered = true,
  ...rest
}: GlassSurfaceProps) {
  // Real Liquid Glass: no extra fill, no extra border — the material owns its edge.
  if (isGlassAvailable && GlassView) {
    return (
      <GlassView
        {...rest}
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={isInteractive}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  // iOS 18 and below: frosted blur plus a hand-drawn edge to imply depth.
  if (Platform.OS === "ios") {
    return (
      <View {...rest} style={[fallbackBordered && styles.fallbackEdge, style]}>
        <BlurView
          intensity={fallbackIntensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  // Android and web: no blur budget worth spending, use an opaque-ish fill.
  return (
    <View
      {...rest}
      style={[styles.solid, fallbackBordered && styles.fallbackEdge, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackEdge: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.09)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  solid: {
    backgroundColor: "rgba(24, 24, 24, 0.92)",
  },
});
