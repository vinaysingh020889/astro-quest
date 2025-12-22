// StarRevealScreen.tsx
import { GoogleGenAI } from "@google/genai"; // Gemini API client
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ALL_GUIDES } from "../../data/guides";
import { colors, glassStyle, gradients, spacing } from "../../theme";

type GuideData = {
  id?: string;
  name: string;
  role: string;
  image: ImageSourcePropType;
};

// ----- DIRECTLY DECLARE YOUR GEMINI KEY HERE -----
const getGeminiKey = () => process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

export default function StarRevealScreen() {
  const router = useRouter();

  const [currentText, setCurrentText] = useState("");
  const [subMessageVisible, setSubMessageVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);

  const guideFadeAnim = useRef(new Animated.Value(0)).current;
  const guideGlowAnim = useRef(new Animated.Value(0)).current;

  // Load guide and animations
  useEffect(() => {
    const loadGuide = async () => {
      const storedId = await AsyncStorage.getItem("selectedGuideId");
      if (storedId) {
        const guide = ALL_GUIDES.find((g) => g.id === storedId);
        if (guide) setGuideData(guide);
      } else {
        setGuideData({
          id: "default",
          name: "Your Cosmic Guide",
          role: "Astrological Mentor",
          image: require("../../assets/guide-placeholder.png"),
        });
      }

      Animated.timing(guideFadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(guideGlowAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
          Animated.timing(guideGlowAnim, { toValue: 0, duration: 1800, useNativeDriver: false }),
        ])
      ).start();
    };

    loadGuide();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    const name = await AsyncStorage.getItem("userName");
    const birthdate = await AsyncStorage.getItem("birthDate");
    const birthtime = await AsyncStorage.getItem("birthTime");
    const birthplace = await AsyncStorage.getItem("birthPlace");
    return { name, birthdate, birthtime, birthplace };
  };

  // Generate predictions
  const generatePredictions = async () => {
    const GEMINI_API_KEY = getGeminiKey();
    if (!GEMINI_API_KEY) {
  const fallback = ["Gemini key missing in .env", "Add EXPO_PUBLIC_GEMINI_API_KEY and restart Expo."];
  setPredictions(fallback);
  setCurrentText(fallback[0]);
  await AsyncStorage.setItem("userPredictions", JSON.stringify(fallback));
  return;
}

    const { name, birthdate, birthtime, birthplace } = await fetchUserData();
    if (name && birthdate && birthtime && birthplace) {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = `
       You are a highly respected Indian Vedic astrologer. 
Analyze the horoscope of ${name}, born on ${birthdate} at ${birthtime} in ${birthplace}. 

➤ Task:
Provide exactly 2 predictions, each in one sentence, maximum 20 words. 

➤ Style:
- Rooted in authentic Vedic astrology principles.  
- Mystical, motivational, and spiritually uplifting.  
- Written in direct, inspiring tone.  

➤ Focus areas:
1. Life path & personal growth  
2. Career or spiritual journey  

➤ Output format:
1. [Prediction one]  
2. [Prediction two]
 
      `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        if (response.text) {
          const lines = response.text.split("\n").filter(Boolean).slice(0, 2);
          setPredictions(lines);
          if (lines.length > 0) setCurrentText(lines[0]);
          await AsyncStorage.setItem("userPredictions", JSON.stringify(lines));
        }
      } catch (err) {
        console.error("Error generating predictions:", err);
        const fallback = ["Your cosmic journey begins now...", "Stars are aligning in your favor."];
        setPredictions(fallback);
        setCurrentText(fallback[0]);
        await AsyncStorage.setItem("userPredictions", JSON.stringify(fallback));
      }
    }
  };

  useEffect(() => {
    generatePredictions();
  }, []);

  // Typewriter animation for first prediction
  useEffect(() => {
    if (!predictions[0]) return;
    let i = 0;
    const interval = setInterval(() => {
      setCurrentText(predictions[0].substring(0, i + 1));
      i++;
      if (i >= predictions[0].length) clearInterval(interval);
    }, 40);

    setTimeout(() => setSubMessageVisible(true), 2000);
    setTimeout(() => setCtaVisible(true), 3500);

    return () => clearInterval(interval);
  }, [predictions]);

  // Orb glow
  const orbAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(orbAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const orbGlow = orbAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(255,215,0,0.2)", "rgba(255,215,0,0.8)"] });

  // CTA pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (ctaVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [ctaVisible]);

  return (
    <LinearGradient colors={colors.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Fixed Orb with guide inside */}
        {guideData && (
          <View style={styles.fixedOrbContainer}>
            <Animated.View style={[styles.orb, { shadowColor: orbGlow, shadowRadius: 25, shadowOpacity: 1 }]}>
              <LinearGradient colors={["#FFD700", "#FFA500"]} style={styles.orbGradient} />
              <Animated.View style={{ opacity: guideFadeAnim, alignItems: "center", justifyContent: "center" }}>
                <Image source={guideData.image} style={styles.guideImage} />
                <Text style={styles.guideName}>{guideData.name}</Text>
              </Animated.View>
            </Animated.View>
          </View>
        )}

        {/* Scrollable content */}
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* First Prediction */}
          <View style={[glassStyle.card, styles.card]}>
            <Text style={styles.message}>{currentText}</Text>
          </View>

          {/* Second Prediction */}
          {subMessageVisible && predictions[1] && (
            <Animated.View style={[glassStyle.card, styles.card, { marginTop: spacing.md }]}>
              <Text style={styles.subMessage}>{predictions[1]}</Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Fixed CTA Button */}
        {ctaVisible && (
          <View style={styles.fixedCTA}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/onboarding/PersonaScreen")}
              >
                <LinearGradient
                  colors={gradients.gold as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={glassStyle.gradientButton}
                >
                  <Text style={glassStyle.selectText}>Reveal More 🔮</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({
  fixedOrbContainer: {
    position: "absolute",
    top: spacing.lg,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 200, // space below fixed orb
    paddingBottom: 120, // space above fixed button
    paddingHorizontal: spacing.lg,
  },

  fixedCTA: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
  },

  // Orb with neumorphic surface
  orb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
    overflow: "hidden",
  },
  orbHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 80,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -8, height: -8 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },

  orbGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 80,
    zIndex: 0,
  },

  // Guide image with neumorphic frame
  guideImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  guideName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
  },

  // Neumorphic card
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },

  message: {
    fontSize: 18,
    color: colors.white,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "600",
  },
  subMessage: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
});