import { Platform } from "react-native";
import type {
  GlassContainerProps,
  GlassStyle,
  GlassViewProps,
} from "expo-glass-effect";
import type React from "react";

/**
 * Safe access layer for `expo-glass-effect`.
 *
 * Liquid Glass is a native iOS 26 material (`UIGlassEffect`). It only exists when
 * all three of these hold:
 *
 *   1. the app runs on iOS 26 or newer,
 *   2. the binary was compiled against the Xcode 26 SDK, and
 *   3. the `expo-glass-effect` native module is linked into that binary.
 *
 * None of those are true in Expo Go or on web, so the module is required lazily
 * and every consumer is expected to branch on `isGlassAvailable`. Importing it
 * statically would hard-crash any runtime that does not ship the native module.
 */

type GlassModule = {
  GlassView: React.ComponentType<GlassViewProps>;
  GlassContainer: React.ComponentType<GlassContainerProps>;
  isLiquidGlassAvailable: () => boolean;
};

function loadGlassModule(): GlassModule | null {
  if (Platform.OS !== "ios") return null;
  try {
    return require("expo-glass-effect") as GlassModule;
  } catch {
    // Native module absent (Expo Go, or a build without the package linked).
    return null;
  }
}

const glassModule = loadGlassModule();

/**
 * True only when the real `UIGlassEffect` material can actually render.
 *
 * Note that this stays `true` when the user has enabled Reduce Transparency —
 * iOS itself degrades the material in that case, which is the behaviour we want.
 */
export const isGlassAvailable: boolean = (() => {
  try {
    return glassModule?.isLiquidGlassAvailable() ?? false;
  } catch {
    return false;
  }
})();

export const GlassView = glassModule?.GlassView ?? null;
export const GlassContainer = glassModule?.GlassContainer ?? null;

export type { GlassStyle };
