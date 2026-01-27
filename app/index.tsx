// app/index.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, glassStyle, spacing } from "../theme";

const { width, height } = Dimensions.get("window");

/* ---------------- Stars & Rotating Moon ---------------- */
function SpaceBackground() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
        easing: (t) => t,
      })
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const stars = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: Math.random() * width,
    top: Math.random() * height,
    size: 1.5 + Math.random() * 3,
    delay: Math.random() * 2000,
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((s) => {
        const opacity = useRef(new Animated.Value(0)).current;

        useEffect(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: 1,
                duration: 1500,
                delay: s.delay,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0.3,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }, []);

        return (
          <Animated.View
            key={s.id}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: "white",
              opacity,
            }}
          />
        );
      })}

      <Animated.Image
        source={require("../assets/images/halfmoon.png")}
        style={{
          position: "absolute",
          top: height * 0.1,
          right: width * 0.15,
          width: 120,
          height: 120,
          opacity: 0.7,
          transform: [{ rotate: rotateInterpolate }],
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  /* 🔐 SESSION CHECK (STEP 11.5) */
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
        const token = await AsyncStorage.getItem("authToken");

        if (!hasOnboarded) {
          setCheckingSession(false);
          return;
        }

        if (hasOnboarded && token) {
          router.replace("/(tabs)");
          return;
        }

        if (hasOnboarded && !token) {
          router.replace("/auth/login");
          return;
        }
      } catch (e) {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  /* Floating animation for card */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* Pulsing animation for button */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ⏳ LOADER WHILE CHECKING SESSION */
  if (checkingSession) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.backgroundGradient[0],
        }}
      >
        <ActivityIndicator size="large" color={colors.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundGradient[0] }}>
      <LinearGradient
        colors={colors.backgroundGradient as [string, string, ...string[]]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <SpaceBackground />

        <Animated.View
          style={[
            glassStyle.card,
            {
              width: "85%",
              alignItems: "center",
              paddingVertical: spacing.lg,
              transform: [{ translateY: floatAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Welcome to Astro Quest</Text>
          <Text style={styles.subtitle}>✨ The stars have aligned for your journey. ✨</Text>

          <Animated.View style={{ transform: [{ scale: pulseAnim }], marginTop: spacing.md }}>
            <TouchableOpacity
              onPress={() => router.push("/onboarding/_stack")}
              style={glassStyle.button}
            >
              <Text style={glassStyle.buttonText}>Let’s Go 🚀</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.gold,
    textAlign: "center",
    textShadowColor: "rgba(255,215,0,0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: colors.white,
    textAlign: "center",
    marginVertical: spacing.sm,
    opacity: 0.9,
  },
});
