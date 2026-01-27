// PersonaScreen.tsx
import { GoogleGenAI } from "@google/genai"; // Gemini API client
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ALL_GUIDES } from "../../data/guides";
import { colors, glassStyle, gradients, spacing } from "../../theme";

const { width, height } = Dimensions.get("window");

const getGeminiKey = () =>
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  "AIzaSyD4Xj4GBoJG5BsWoOUE0n7H_vc_IyqLgVU";

const makeId = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;

/* ---------------- SparkleLayer ---------------- */
function SparkleLayer() {
  const sparklesRef = useRef<any[]>(null);
  const animRefs = useRef<Animated.Value[]>([]);

  if (!sparklesRef.current) {
    sparklesRef.current = Array.from({ length: 25 }).map((_, i) => ({
      id: `star-${i}-${Math.random().toString(36).slice(2, 9)}`,
      left: Math.random() * width,
      top: Math.random() * height,
      size: 2 + Math.random() * 3,
      duration: 2500 + Math.random() * 2500,
    }));
    animRefs.current = sparklesRef.current.map(
      () => new Animated.Value(Math.random())
    );
  }

  useEffect(() => {
    const animations = animRefs.current.map((anim, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: sparklesRef.current![idx].duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: sparklesRef.current![idx].duration,
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () =>
      animRefs.current.forEach((a) => a.stopAnimation?.());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {sparklesRef.current.map((s, idx) => {
        const opacity = animRefs.current[idx].interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });
        return (
          <Animated.View
            key={s.id}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              opacity,
              transform: [{ scale: 1 + Math.random() * 0.3 }],
            }}
          >
            <View
              style={{
                width: s.size,
                height: s.size,
                backgroundColor: "white",
                borderRadius: s.size / 2,
              }}
            />
          </Animated.View>
        );
      })}
      <Image
        source={require("../../assets/images/halfmoon.png")}
        style={{
          position: "absolute",
          top: height * 0.1,
          right: width * 0.15,
          width: 120,
          height: 120,
          resizeMode: "contain",
          opacity: 0.6,
        }}
      />
    </View>
  );
}

/* ---------------- Chat Bubble ---------------- */
function MessageBubble({ item }: { item: any }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      key={String(item.id)}
      style={[
        styles.messageBubble,
        item.type === "guide" ? styles.guideBubble : styles.userBubble,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </Animated.View>
  );
}

/* ---------------- PersonaScreen ---------------- */
export default function PersonaScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [guideData, setGuideData] = useState<any>(null);
  const [userInput, setUserInput] = useState("");
  const [inputVisible, setInputVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Guide glow
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Pulse animation for CTA
  useEffect(() => {
    if (ctaVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [ctaVisible]);

  const avatarGlow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.6)"],
  });

  // Load guide
  useEffect(() => {
    const loadGuide = async () => {
      const storedId = await AsyncStorage.getItem("selectedGuideId");
      if (storedId) {
        const found = ALL_GUIDES.find((g) => g.id === storedId);
        if (found) setGuideData(found);
      }
    };
    loadGuide();
  }, []);

  // Load user name
  const [userName, setUserName] = useState("Traveler");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toISOString()
  );

  useEffect(() => {
    AsyncStorage.getItem("userName").then((n) => n && setUserName(n));
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
        });
      } else {
        console.warn("Location permission not granted");
      }
    })();
  }, []);

  // Load predictions + greeting once (avoid React 18 double-run in dev)
  useEffect(() => {
    let isMounted = true; // cleanup guard

    const loadPredictions = async () => {
      if (!isMounted) return;

      const stored = await AsyncStorage.getItem("userPredictions");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.forEach((p: string, idx: number) => {
          setTimeout(() => {
            if (!isMounted) return;
            setMessages((prev) => [
              ...prev,
              { id: makeId("msg"), type: "guide", text: `🔮 ${p}` },
            ]);
          }, idx * 2000);
        });

        setTimeout(() => {
          if (!isMounted) return;
          const greet = [
            `✨ Hi ${userName}, I am your cosmic guide.`,
            "What is on your mind today? Ask me, I will use Prashna Kundali to answer your query! While asking the query please note give me exact location and time from where and when are you asking the question.",
          ];
          greet.forEach((line, i) => {
            setTimeout(() => {
              if (!isMounted) return;
              setMessages((prev) => [
                ...prev,
                { id: makeId("msg"), type: "guide", text: line },
              ]);
              if (i === greet.length - 1) setInputVisible(true);
            }, i * 2500);
          });
        }, parsed.length * 2000 + 500);
      } else {
        const greet = [
          `✨ Hi ${userName}, I am your cosmic guide.`,
          "What is on your mind today? Ask me, I will use Prashna Kundali to answer your query! While asking the query please note give me exact location and time from where and when are you asking the question.",
        ];
        greet.forEach((line, i) => {
          setTimeout(() => {
            if (!isMounted) return;
            setMessages((prev) => [
              ...prev,
              { id: makeId("msg"), type: "guide", text: line },
            ]);
            if (i === greet.length - 1) setInputVisible(true);
          }, i * 2500);
        });
      }
    };

    loadPredictions();
    return () => {
      isMounted = false; // cleanup stops double execution
    };
  }, [userName]);

  // Auto-scroll chat
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Send user input
  const sendUserQuery = async () => {
    if (!userInput.trim()) return;

    const query = userInput.trim();

    // show user message
    setMessages((prev) => [
      ...prev,
      { id: makeId("msg"), type: "user", text: query },
    ]);

    setUserInput("");
    setInputVisible(false);
    setLoading(true);

    const GEMINI_API_KEY = getGeminiKey();

    // 🔒 KEY CHECK
    if (!GEMINI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId("msg"),
          type: "guide",
          text: "⚠️ Gemini API key missing. Add EXPO_PUBLIC_GEMINI_API_KEY and restart Expo.",
        },
      ]);
      setLoading(false);
      setInputVisible(true);
      return;
    }

    const now = new Date().toISOString();
    const prompt = `You are a highly respected Indian Vedic astrologer, deeply skilled in Prashna Kundali (Horary Astrology).
Respond in 1–2 sentences only. Be precise, calm, spiritual, and confident.

Question: ${query}
Time of asking: ${now}
Location: ${location ? `Lat ${location.lat}, Lon ${location.lon}` : "Unknown"
      }`;

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const text =
        response.text?.trim() ||
        "The stars are silent right now. Please try again shortly.";

      const newMessage = { id: makeId("msg"), type: "guide", text };
      setMessages((prev) => [...prev, newMessage]);

      // persist predictions
      const prevRaw = await AsyncStorage.getItem("userPredictions");
      const prev = prevRaw ? JSON.parse(prevRaw) : [];
      prev.push(text);
      await AsyncStorage.setItem(
        "userPredictions",
        JSON.stringify(prev)
      );

      setTimeout(() => setCtaVisible(true), 500);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId("msg"),
          type: "guide",
          text: "I am unable to read the stars right now.",
        },
      ]);
    } finally {
      setLoading(false);
      setInputVisible(true);
    }
  };

  // Finish onboarding
const finishOnboarding = async () => {
  if (submitting) return;

  try {
    setSubmitting(true);

    const birthDate = await AsyncStorage.getItem("birthDate");
    const birthTime = await AsyncStorage.getItem("birthTime");
    const birthPlace = await AsyncStorage.getItem("birthPlace");

    const res = await fetch("http://192.168.1.50:5050/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: userName,
        birthDate,
        birthTime,
        birthPlace,
      }),
    });

    if (!res.ok) {
      throw new Error("Onboarding API failed");
    }

    const data = await res.json();

    if (!data?.tempOnboardingId) {
      throw new Error("tempOnboardingId missing");
    }

    await AsyncStorage.setItem("tempOnboardingId", data.tempOnboardingId);
    await AsyncStorage.setItem("hasOnboarded", "true");

    router.replace("/auth/login");
  } catch (err) {
    console.error("❌ Onboarding error:", err);
    alert("Something went wrong. Please try again.");
  } finally {
    setSubmitting(false); // 🔥 THIS WAS MISSING
  }
};


  return (
    <LinearGradient
      colors={colors.backgroundGradient as [string, string]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <SparkleLayer />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            {/* Guide avatar */}
            <Animated.View
              style={[
                styles.avatarContainer,
                {
                  shadowColor: Platform.OS === "ios" ? avatarGlow : colors.shadowDark,
                  shadowOpacity: 1,
                  shadowRadius: 20,
                },
              ]}
            >
              <Image source={guideData?.image} style={styles.avatar} />
              <Text style={styles.avatarName}>
                {guideData?.name
                  ? `${guideData.name} — Your Cosmic Guide`
                  : "Your Cosmic Guide"}
              </Text>
            </Animated.View>

            {/* Chat */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => <MessageBubble item={item} />}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{
                paddingBottom: spacing.lg + 140,
                paddingTop: spacing.md,
              }}
            />

            {/* Loading indicator */}
            {loading && (
              <View style={{ marginBottom: spacing.md }}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={{ color: colors.white, marginTop: 4 }}>
                  ✨ Cosmic guide is thinking...
                </Text>
              </View>
            )}

            {/* Input */}
            {inputVisible && !loading && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: spacing.md,
                }}
              >
                <TextInput
                  value={userInput}
                  onChangeText={setUserInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: spacing.md,
                    borderRadius: 20,
                    color: colors.white,
                  }}
                />
                <Pressable
                  onPress={sendUserQuery}
                  style={{ marginLeft: spacing.sm }}
                >
                  <LinearGradient
                    colors={gradients.gold as [string, string]}
                    style={{ padding: spacing.md, borderRadius: 20 }}
                  >
                    <Text style={{ color: colors.black }}>Ask</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}

            {/* Fixed CTA */}
            {ctaVisible && (
              <View style={styles.fixedCTA}>
                <Animated.View
                  style={{ transform: [{ scale: pulseAnim }] }}
                >
                  <Pressable onPress={finishOnboarding}>
                    <LinearGradient
                      colors={gradients.gold as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={glassStyle.gradientButton}
                    >
                      <Text style={glassStyle.selectText}>
                        I want more!
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background || colors.surface,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },

  // Avatar with neumorphic frame
  avatarContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.sm,
  },
  avatarHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 55,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: "center",
  },

  // Message bubbles with neumorphic soft surfaces
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    marginVertical: spacing.xs,
    maxWidth: "80%",
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  messageBubbleHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
  },
  guideBubble: {
    alignSelf: "flex-start",
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  messageText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
  },

  // Fixed CTA area (neumorphic button container)
  fixedCTA: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 28,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    padding: spacing.md,
  },
  fixedCTAHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
  },
});


