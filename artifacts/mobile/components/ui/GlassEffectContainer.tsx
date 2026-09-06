import React from "react";
import { View, type ViewStyle } from "react-native";

import { GlassContainer, isGlassAvailable } from "@/lib/glass";

interface GlassEffectContainerProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /**
   * Distance at which sibling glass elements begin to merge into each other.
   * Larger values make them blend from further apart.
   */
  spacing?: number;
}

/**
 * Groups sibling glass elements so they refract as one material and visually
 * merge when they come close — the behaviour Apple calls a glass effect
 * container.
 *
 * This only does something for direct glass children (`GlassSurface`), and only
 * on an iOS 26 build. Everywhere else it is a plain layout `View`, so the
 * children fall back to their own frosted/solid rendering.
 */
export function GlassEffectContainer({
  children,
  style,
  spacing = 20,
}: GlassEffectContainerProps) {
  if (isGlassAvailable && GlassContainer) {
    return (
      <GlassContainer spacing={spacing} style={style}>
        {children}
      </GlassContainer>
    );
  }

  return <View style={style}>{children}</View>;
}
