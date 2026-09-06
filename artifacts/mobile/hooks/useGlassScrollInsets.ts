import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isGlassAvailable } from "@/lib/glass";

/** Height of the floating GlassHeader plus the gap above it. */
const HEADER_CLEARANCE = 110;
/** Clearance for the absolutely-positioned JS fallback tab bar. */
const FALLBACK_TAB_CLEARANCE = 150;
/** The web preview renders an extra chrome strip above the app. */
const WEB_TOP_PADDING = 67;

/**
 * Scroll padding for a tab screen that sits behind the floating glass header
 * and the tab bar.
 *
 * Content is meant to pass *underneath* both surfaces rather than stop short of
 * them — glass is a refractive material, so with nothing travelling behind it
 * there is nothing for it to bend and it reads as a flat gray bar.
 *
 * The two paths differ in who owns the inset:
 *
 * - Native (iOS 26) tabs: the tab bar belongs to `UITabBarController`, so UIKit
 *   applies the bottom inset itself once `contentInsetAdjustmentBehavior` is
 *   `automatic`. That is also what drives the scroll-edge transition and the
 *   minimize-on-scroll gesture, so it is not optional. UIKit adds the top safe
 *   area too, hence no `insets.top` below.
 * - Fallback: the tab bar is an absolutely-positioned RN view that the scroll
 *   view knows nothing about, so every inset is manual.
 */
export function useGlassScrollInsets() {
  const insets = useSafeAreaInsets();
  const webTopPadding = Platform.OS === "web" ? WEB_TOP_PADDING : 0;

  // For plain (non-scrolling) containers pinned to the top of the screen.
  // Nothing adjusts these for us on either path, so they always carry the inset.
  const headerPaddingTop = insets.top + HEADER_CLEARANCE + webTopPadding;

  if (isGlassAvailable) {
    return {
      // UIKit contributes the top safe area to scroll views that reach the top
      // of the screen, so only the header clearance is added here.
      paddingTop: HEADER_CLEARANCE,
      paddingBottom: 24,
      headerPaddingTop,
      contentInsetAdjustmentBehavior: "automatic",
    } as const;
  }

  return {
    paddingTop: headerPaddingTop,
    paddingBottom: FALLBACK_TAB_CLEARANCE,
    headerPaddingTop,
    contentInsetAdjustmentBehavior: "never",
  } as const;
}
