// app/(tabs)/_layout.tsx
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { colors } from "../../theme";

export default function HomeTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // 🔹 Hide labels
        tabBarStyle: styles.tabBarContainer, // background handled by gradient
        tabBarBackground: () => ( // 🔹 Gradient background
          <LinearGradient
            colors={[colors.semidark, colors.extradark]}
             style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.accent,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <IconWrapper focused={focused}>
              <MaterialCommunityIcons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            </IconWrapper>
          ),
        }}
      />

      {/* Chat */}
      <Tabs.Screen
        name="Chat"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <IconWrapper focused={focused}>
              <MaterialCommunityIcons
                name={focused ? "message-text" : "message-text-outline"}
                size={size}
                color={color}
              />
            </IconWrapper>
          ),
        }}
      />

      {/* Recommendation / Explore */}
      <Tabs.Screen
        name="Recommendation"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <IconWrapper focused={focused}>
              <Feather name="compass" size={size} color={color} />
            </IconWrapper>
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <IconWrapper focused={focused}>
              <MaterialCommunityIcons
                name={focused ? "account-circle" : "account-circle-outline"}
                size={size}
                color={color}
              />
            </IconWrapper>
          ),
        }}
      />
    </Tabs>
  );
}

// 🔹 Custom Icon Wrapper with gradient + beveled glow
function IconWrapper({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  if (focused) {
    return (
      <LinearGradient
        colors={[colors.extradark, colors.semidark]}
        style={styles.activeIconWrapper}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={styles.iconWrapper}>{children}</View>;
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 16,
    left: 16,
    right: 16,
    height: 74,
    borderRadius: 36,
    borderColor: colors.shadowDark,
    overflow: "hidden", // ensures gradient stays within rounded corners
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 6,
    paddingTop: 12,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)", // subtle inactive base
    marginTop:10,
  },
  activeIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
    marginTop:10,
  },
});
