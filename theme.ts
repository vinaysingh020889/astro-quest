// app/theme.ts
import { ColorValue, Platform, StyleSheet } from "react-native";

/**
 * 🎨 Neumorphism (Soft UI) Cosmic Theme
 * - Full-line-by-line upgrade from your original theme
 * - Preserves original exported names (colors, gradients, spacing, icon, text, glassStyle)
 * - Adds Neumorphic shadows + helper highlight styles for top-left highlight
 *
 * Usage notes:
 * - "glassStyle" retains all keys your app already expects (card, button, input, etc.)
 * - For a full soft UI effect, compose the base style with the corresponding "*Highlight" style
 *   (e.g. wrap a View with styles [glassStyle.card, glassStyle.cardHighlight]) to get dual-shadow
 *   (dark bottom-right shadow + subtle light top-left highlight). React Native does not support
 *   two simultaneous shadow declarations on a single view — layering is the recommended pattern.
 */

export const colors = {
  // Background / cosmic depth (kept as a tuple for gradient compatibility)
  backgroundGradient: [
    "#14011aff",
    "#23023fff",
    "#34025cff",
  ] as [ColorValue, ColorValue, ...ColorValue[]], // ✅ tuple, same shape as before

  // Core palette (kept your original names so nothing breaks)
  background: "#1d0234ff",
  surface: "#34025cff", // component surface for neumorphism

  primary: "#34025cff",     // luxurious neon pink-red (kept)
  accent: "#e1c3faff",
  superlight: "#d1a2f7ff",
  white: "#FFFFFF",
  black: "#23023fff",
  extradark: "#1d0234ff",
  gold: "#f8d94eff",
  light: "#8c00ffff",
  semidark: "#58049cff",

  // Neumorphic / shadow tokens (use these for consistent shadows across components)
  // Dark shadow (bottom-right)
  shadowDark: "rgba(3, 2, 14, 0.55)",
  // Light highlight (top-left) — very subtle white-ish highlight
  shadowLight: "rgba(255, 255, 255, 0.06)",

  // legacy glass tokens kept for compatibility — mapped to neumorphic friendly values
  glassBg: "rgba(255,255,255,0.02)",
  glassBorder: "rgba(255,255,255,0.03)",

  // Tabs / inputs
  tabActiveBg: "rgba(131, 9, 231, 0.12)",
  tabInactiveBg: "transparent",
  inputBg: "rgba(255,255,255,0.02)",
};

export const gradients = {
  gold: ["#ffd700", "#ffee88"] as [ColorValue, ColorValue],
  cosmic: colors.backgroundGradient, // ✅ uses the tuple above
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 24,
  xl: 36,
};

export const icon = {
  primary: colors.white,
  accent: colors.accent,
  activeTab: colors.tabActiveBg,
  inactiveTab: colors.tabInactiveBg,
};

export const text = {
  buttonSmall: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
};

// -----------------------------------------------------------------------------
// Helpers: platform-aware shadow snippets (use via spread in style objects)
// -----------------------------------------------------------------------------

const darkShadow = Platform.select({
  ios: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
  },
  android: {
    // Android only respects elevation — pick an elevation that approximates the iOS look
    elevation: 8,
  },
});

const lightHighlight = Platform.select({
  ios: {
    // light highlight that should be placed on a separate overlaid view (top-left)
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  android: {
    // Android has no easy "light highlight" shadow; you can use a subtle translucent
    // white border or absolutely positioned light overlay instead.
    elevation: 0,
  },
});

// -----------------------------------------------------------------------------
// Neumorphic styles (keeps original keys so you can drop this file in place)
// Usage: For dual-shadow (raised) effect: apply [style, styleHighlight]
//        For inset (pressed) effect: apply style + styleInset (provided)
// -----------------------------------------------------------------------------

export const glassStyle = StyleSheet.create({
  // Containers / Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 40,
    // keep a hairline border for depth but very subtle
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 24,
    margin: 12,
    // dark shadow (bottom-right)
    ...((darkShadow as any) || {}),
  },
  // highlight layer to be used in composition: [glassStyle.card, glassStyle.cardHighlight]
  cardHighlight: {
    // light highlight (top-left). Note: must be applied as a separate layer to simulate
    // dual shadows (React Native only supports one shadow per View). Example usage:
    // <View style={[glassStyle.card]}> <View style={glassStyle.cardHighlight} /> ... </View>
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: "transparent",
    ...((lightHighlight as any) || {}),
    // pointerEvents none so it doesn't block touches when layered
    // (you'll need to set pointerEvents on the overlay view in your JSX)
  },

  // Buttons (embossed / raised soft UI style)
  button: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 36,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    ...((darkShadow as any) || {}),
  },
  // highlight for button (apply as a sibling overlay for top-left light)
  buttonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: "transparent",
    ...((lightHighlight as any) || {}),
  },
  buttonText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  selectText: {
    color: colors.primary as string,
    fontWeight: "800",
    fontSize: 16,
  },

  // Floating action / neumorphic circular button
  floatingButton: {
    backgroundColor: colors.surface,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    ...((darkShadow as any) || {}),
  },
  floatingButtonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    backgroundColor: "transparent",
    ...((lightHighlight as any) || {}),
  },

  // Input / TextField (inset style by default)
  input: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 22,
    color: colors.white,
    fontSize: 16,

    // make it look slightly inset by using a reduced bottom-right shadow and a
    // subtle top-left highlight (use composition with inputHighlight to get full effect)
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 10,
    elevation: 4,
  },
  inputHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    backgroundColor: "transparent",
    ...((lightHighlight as any) || {}),
  },

  // Tab Bar / Bottom Navigation (neumorphic pill)
  tabBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingBottom: 8,
    paddingTop: 8,
    ...((darkShadow as any) || {}),
  },
  tabIconWrapper: {
    padding: 10,
    borderRadius: 18,
  },

  // Modals / Popups
  modal: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderColor: colors.glassBorder,
    borderRadius: 28,
    padding: 24,
    ...((darkShadow as any) || {}),
  },

  // Badges / Pill labels (slightly raised)
  badge: {
    backgroundColor: colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 14,
    ...((darkShadow as any) || {}),
  },
  badgeText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },

  // Divider / borders
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: 12,
    opacity: 0.85,
  },

  // Typography / Hierarchy
  header: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  subHeader: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  bodyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  smbodyText:{
   fontSize: 12, 
   padding: 5,
   color: colors.gold,
  },

  // Shadow Cards for emphasis (slightly different radius)
  shadowCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    borderWidth: 0,
    padding: 18,
    margin: 10,
    ...((darkShadow as any) || {}),
  },
  shadowCardHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    backgroundColor: "transparent",
    ...((lightHighlight as any) || {}),
  },

  // Shadow Buttons (alternate size)
  shadowButton: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    ...((darkShadow as any) || {}),
  },
  shadowButtonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: "transparent",
    ...((lightHighlight as any) || {}),
  },

  // Gradient Button (apply a LinearGradient component around the button)
  gradientButton: {
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 36,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    ...((darkShadow as any) || {}),
  },
});

export default {
  colors,
  gradients,
  spacing,
  icon,
  text,
  glassStyle,
};
