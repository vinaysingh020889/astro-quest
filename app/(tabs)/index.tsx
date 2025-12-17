// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ALL_GUIDES } from "../../data/guides"; // adjust path
import { colors, glassStyle } from "../../theme";
const { width } = Dimensions.get("window");

/* ---------- Helpers ---------- */
const makeId = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/* ------------------ Energy Meter (redesigned: percent left, bar right) ------------------ */
function EnergyMeter({ percent = 0.72 }: { percent?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: percent,
      duration: 1000,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const widthInterp = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const displayPercent = Math.round(percent * 100);

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 14 }}>Daily Cosmic Energy</Text>

      <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}>
        {/* small percent on the left */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,215,0,0.06)",
            marginRight: 12,
            borderWidth: 1,
            borderColor: "rgba(255,215,0,0.06)",
            shadowColor: colors.gold,
            shadowOpacity: 0.06,
            shadowRadius: 10,
          }}
        >
          <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 18 }}>{displayPercent}%</Text>
          <Text style={{ color: colors.light, fontSize: 10, marginTop: 2 }}>Favorable</Text>
        </View>

        {/* bar on the right */}
        <View style={{ flex: 1 }}>
          <View style={{ height: 12, backgroundColor: "#0b0711", borderRadius: 12, overflow: "hidden" }}>
            <Animated.View style={{ width: widthInterp, height: "100%", backgroundColor: colors.gold, borderRadius: 12 }} />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ color: colors.light, fontSize: 12 }}>Low</Text>
            <Text style={{ color: colors.light, fontSize: 12 }}>High</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------ Planetary Highlight / Cosmic Event ------------------ */
function PlanetaryHighlight() {
  const events = useMemo(
    () => [
      { id: "e1", title: "Venus enters Libra", detail: "Love and harmony increase. Great for relationships." },
      { id: "e2", title: "Moon sextile Jupiter", detail: "Emotional generosity — good for connecting." },
      { id: "e3", title: "Mars square Saturn", detail: "Drive meets friction — be deliberate." },
    ],
    []
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % events.length), 4200);
    return () => clearInterval(id);
  }, [events.length]);

  const event = events[index];

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 14 }}>Cosmic Event</Text>
      <Pressable onPress={() => {}}>
        <LinearGradient colors={["#23023fff", "#1b0131ff"]} style={{ marginTop: 8, padding: 12, borderRadius: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "rgba(255,215,0,0.08)", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
              <Ionicons name="planet" size={26} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.gold, fontWeight: "900" }}>{event.title}</Text>
              <Text style={{ color: colors.light, marginTop: 6 }}>{event.detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.light} />
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

/* ------------------ Mystery Hints (unchanged) ------------------ */
function MysteryHint({ onUnlock }: { onUnlock?: () => void }) {
  const [locked, setLocked] = useState(true);

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 14 }}>Mystery Hint</Text>
      <View style={{ marginTop: 8 }}>
        <View style={{ borderRadius: 14, overflow: "hidden" }}>
          <View style={{ padding: 14, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,215,0,0.04)" }}>
            <Text style={{ color: colors.light, marginBottom: 10 }}>
              {locked ? "A subtle shift is aligning in your career sector — (locked)" : "A new opportunity appears around mid-month. Prepare your pitch."}
            </Text>

            {locked ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: colors.light, fontSize: 12 }}>Unlock by spending 10 coins or completing today's quest.</Text>
                <Pressable
                  onPress={() => {
                    setLocked(false);
                    onUnlock && onUnlock();
                  }}
                  style={{ backgroundColor: "rgba(255,215,0,0.18)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
                >
                  <Text style={{ color: colors.gold, fontWeight: "900" }}>Unlock</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={{ color: colors.gold, fontWeight: "700", marginTop: 6 }}>Unlocked • Free insight granted</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------ Quests, XP & Streaks (unchanged) ------------------ */
const LEVELS = [
  { name: "Seeker", threshold: 0 },
  { name: "Believer", threshold: 500 },
  { name: "Mystic", threshold: 1500 },
  { name: "Sage", threshold: 3500 },
  { name: "Cosmic Guide", threshold: 7000 },
];

function StreakXpBar({ xp }: { xp: number }) {
  let current = LEVELS[0];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) current = LEVELS[i];
  }
  const nextIndex = Math.min(LEVELS.findIndex((l) => l.name === current.name) + 1, LEVELS.length - 1);
  const next = LEVELS[nextIndex];

  const progressToNext = next.threshold === current.threshold ? 1 : (xp - current.threshold) / (next.threshold - current.threshold);

  const interp = useRef(new Animated.Value(progressToNext)).current;
  useEffect(() => {
    Animated.timing(interp, { toValue: progressToNext, duration: 800, useNativeDriver: false }).start();
  }, [progressToNext]);

  const widthInterp = interp.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 14 }}>Progress</Text>
      <View style={{ marginTop: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: colors.white, fontWeight: "800" }}>{current.name}</Text>
          <Text style={{ color: colors.light }}>{xp} XP</Text>
        </View>
        <View style={{ height: 10, backgroundColor: "#111", borderRadius: 8, overflow: "hidden" }}>
          <Animated.View style={{ width: widthInterp, height: "100%", backgroundColor: colors.gold, borderRadius: 8 }} />
        </View>
        <Text style={{ color: colors.light, fontSize: 12, marginTop: 6 }}>{next.name} at {next.threshold} XP</Text>
      </View>
    </View>
  );
}

function QuestsPanel({ onComplete }: { onComplete?: (id: string) => void }) {
  const initial = [
    { id: "q1", title: "Daily Check-in", progress: 0, goal: 1, xp: 10 },
    { id: "q2", title: "Do a Tarot Pull", progress: 0, goal: 1, xp: 20 },
    { id: "q3", title: "Ask a Prashna", progress: 0, goal: 1, xp: 25 },
  ];
  const [quests, setQuests] = useState(initial);

  const completeQuest = async (id: string) => {
    const newQ = quests.map((q) => (q.id === id ? { ...q, progress: q.goal } : q));
    setQuests(newQ);
    onComplete && onComplete(id);
  };

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 14 }}>Quests</Text>
      <View style={{ marginTop: 8 }}>
        {quests.map((q) => {
          const done = q.progress >= q.goal;
          return (
            <View key={q.id} style={{ marginBottom: 10, padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,215,0,0.04)" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ color: colors.white, fontWeight: "800" }}>{q.title}</Text>
                  <Text style={{ color: colors.light, fontSize: 12 }}>{q.progress}/{q.goal} • {q.xp} XP</Text>
                </View>
                <Pressable
                  onPress={() => completeQuest(q.id)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: done ? "rgba(255,255,255,0.04)" : "rgba(255,215,0,0.18)" }}
                >
                  <Text style={{ color: done ? colors.light : colors.gold, fontWeight: "900" }}>{done ? "Done" : "Complete"}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- SwipeableInsights (tarot-style, smooth swipe, flip reveal) ---------- */
function SwipeableInsights({ data }: { data: any[] }) {
  const [cards, setCards] = useState(data);
  const [endMessage, setEndMessage] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [guide, setGuide] = useState<any>(null);

useEffect(() => {
  const loadGuide = async () => {
    const storedId = await AsyncStorage.getItem("selectedGuideId");
    if (storedId) {
      const found = ALL_GUIDES.find((g) => g.id === storedId);
      if (found) setGuide(found);
    }
  };
  loadGuide();
}, []);

  const pan = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current; // 0 -> front, 1 -> back
  const animating = useRef(false);

  // Reset flip when top card changes
  useEffect(() => {
    flipAnim.setValue(0);
    setRevealed(null);
  }, [cards.length, flipAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
      onPanResponderGrant: () => {
        // Ensure no offset to avoid "stuck in corner" behaviour
        try {
          pan.setOffset({ x: 0, y: 0 });
        } catch {}
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        const threshold = 120;
        const velocityThreshold = 0.6;
        if (Math.abs(gesture.dx) > threshold || Math.abs(gesture.vx) > velocityThreshold) {
          if (animating.current) return;
          animating.current = true;
          const toRight = gesture.dx > 0 || gesture.vx > velocityThreshold;
          const targetX = toRight ? width * 1.4 : -width * 1.4;
          Animated.timing(pan, {
            toValue: { x: targetX, y: gesture.dy },
            duration: 260,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            // remove top card
            const newCards = [...cards];
            newCards.pop();
            setCards(newCards);
            if (newCards.length === 0) setEndMessage(true);
            // reset pan and flip
            pan.setValue({ x: 0, y: 0 });
            flipAnim.setValue(0);
            setRevealed(null);
            animating.current = false;
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true, bounciness: 8 }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ height: 300, marginTop: 58, marginBottom: 38, justifyContent: "center", alignItems: "center" }}>
      {cards.length > 0 ? (
        cards
          .slice()
          .reverse()
          .map((card, idx) => {
            // idx === 0 -> top card (because reversed)
            const isTop = idx === 0;
            const stackOffset = idx * 8;

            // top card transforms
            const translateX = isTop ? pan.x : new Animated.Value(0);
            const translateY = isTop ? pan.y : new Animated.Value(stackOffset);
            const rotate = isTop
              ? pan.x.interpolate({ inputRange: [-width, 0, width], outputRange: ["-12deg", "0deg", "12deg"], extrapolate: "clamp" })
              : "0deg";
            const scale = isTop ? pan.x.interpolate({ inputRange: [-width, 0, width], outputRange: [0.98, 1, 0.98], extrapolate: "clamp" }) : 0.98 - idx * 0.01;

            // flip interpolation (only meaningful for top card)
            const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
            const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
            const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0], extrapolate: "clamp" });
            const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1], extrapolate: "clamp" });

            // card container style
            const containerStyle: any = {
              position: "absolute",
              width: width * 0.8,
              height: 360,
              borderRadius: 20,
              backgroundColor: "rgba(20, 1, 36, 1)",
              borderWidth: 1,
              borderColor: "rgba(164, 52, 255, 0.7)",
              padding: 16,
              shadowColor: colors.gold,
              shadowOpacity: isTop ? 0.35 : 0.18,
              shadowRadius: 12,
              zIndex: cards.length - idx,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              transform: [
                { translateX: isTop ? translateX : 0 },
                { translateY: isTop ? translateY : stackOffset },
                { rotate: isTop ? rotate : "0deg" },
                { scale: isTop ? scale : 0.98 - idx * 0.01 },
              ],
            };

            type Guide = {
              id: string;
              name: string;
              title: string;
              rating: number;
              specialties: string[];
              image: any;
            };

            return (
              <Animated.View
                key={card.id}
                {...(isTop ? panResponder.panHandlers : {})}
                style={containerStyle}
              >
                {/* Decorative background circle */}
                <View
                  style={{
                    position: "absolute",
                    right: -40,
                    top: -40,
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: "rgba(255,215,0,0.02)",
                    transform: [{ rotate: "12deg" }],
                  }}
                />

                {/* FRONT SIDE (image + title) */}
                <Animated.View
                  pointerEvents={revealed === card.id ? "none" : "auto"}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: frontOpacity,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      // flip to reveal
                      if (revealed === card.id) {
                        setRevealed(null);
                        Animated.timing(flipAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
                      } else {
                        setRevealed(card.id);
                        Animated.timing(flipAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
                      }
                    }}
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Image
                      source={guide?.image ?? require("../../assets/images/guide1.png")}
                      style={{ width: 120, height: 170, borderRadius: 12, marginBottom: 12 }}
                      resizeMode="cover"
                    />
                    <Text style={styles.guideName}> {guide?.name ?? "Your Cosmic Guide"} </Text>
                    <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}>{card.title}</Text>
                    <Text style={{ color: colors.light, fontSize: 12, marginTop: 6 }}>Tap to reveal your insight</Text>
                  </Pressable>
                </Animated.View>

                {/* BACK SIDE (content revealed) */}
                <Animated.View
                  pointerEvents={revealed === card.id ? "auto" : "none"}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    transform: [{ perspective: 1000 }, { rotateY: backRotate }],
                    paddingHorizontal: 6,
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: colors.gold, fontSize: 16, fontWeight: "900", marginBottom: 6, textAlign: "left" }}>
                    {card.title}
                  </Text>

                  <Text style={{ color: colors.white, fontSize: 20, fontWeight: "900", marginBottom: 10 }}>{card.value}</Text>

                  <Text style={{ color: colors.light, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                    {/* long text allowed and will wrap to multiple lines */}
                    {card.note ||
                      "Today’s energies surround you with a gentle flow — keep your intentions clear and watch for small signs. Stay open to new connections and be ready to act when opportunities appear."}
                  </Text>

                  {/* Action row: pill + message stacked correctly */}
                  <View style={{ marginTop: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <View
                        style={{
                          backgroundColor: "rgba(255,215,0,0.12)",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 14,
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: "rgba(255,215,0,0.08)",
                        }}
                      >
                        <Text style={{ color: colors.gold, fontWeight: "800", fontSize: 12 }}>Action</Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(255,255,255,0.02)",
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <Text style={{ color: colors.light, fontSize: 13, lineHeight: 18 }}>
                          Tap to explore strategies & guidance — or swipe the card away to see the next insight.
                        </Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            );
          })
      ) : endMessage ? (
        <Animated.View
          style={[
            glassStyle.card,
            {
              width: width * 0.78,
              height: 200,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 18,
              shadowColor: colors.gold,
              shadowOpacity: 0.4,
              shadowRadius: 10,
            },
          ]}
        >
          <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900", textAlign: "center" }}>✨ Soon we will have more revelations… ✨</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

/* ---------- DailyHoroscope (original) ---------- */
function DailyHoroscope() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0.75,
      duration: 1800,
      useNativeDriver: false,
    }).start();
  }, []);

  const widthInterp = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={{ marginVertical: 18 }}>
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 18, marginBottom: 12 }}>Today's Horoscope</Text>
      <LinearGradient colors={["#34025cff", "#23023fff"]} style={{ borderRadius: 20, padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,215,0,0.2)", justifyContent: "center", alignItems: "center", marginRight: 14 }}>
            <Ionicons name="moon" size={32} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.white, fontWeight: "700", fontSize: 16 }}>Zodiac: Aries</Text>
            <Text style={{ color: colors.light, fontSize: 14, marginTop: 4 }}>Your intuition is high today. Trust your instincts!</Text>
            <Text style={{ color: colors.gold, fontSize: 12, marginTop: 6 }}>Global Recommendation: Focus on creativity and networking.</Text>
            <View style={{ height: 10 }} />
            <View style={{ height: 8, backgroundColor: "#23023fff", borderRadius: 8, overflow: "hidden" }}>
              <Animated.View style={{ width: widthInterp, height: "100%", backgroundColor: colors.gold, borderRadius: 8 }} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- Wallet (unchanged) ---------- */
function Wallet({ coins = 120, premium = 30, onBuy }: { coins?: number; premium?: number; onBuy?: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1.05, duration: 1000, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true })])).start();
  }, []);

  return (
    <Animated.View style={{ marginVertical: 18, padding: 16, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", transform: [{ scale: pulse }], shadowColor: colors.gold, shadowOpacity: 0.5, shadowRadius: 10 }}>
      <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 16 }}>Wallet</Text>
      <Text style={{ color: colors.white, fontWeight: "700", fontSize: 18, marginVertical: 4 }}>Coins: {coins}</Text>
      <Text style={{ color: colors.white, fontWeight: "700", fontSize: 18 }}>Premium Coins: {premium}</Text>
      <Pressable onPress={() => onBuy && onBuy()} style={{ marginTop: 8, alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "rgba(255,215,0,0.2)" }}>
        <Text style={{ color: colors.gold, fontWeight: "900" }}>Buy More</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ---------- CosmicHeader (enhanced to be main XP anchor) ---------- */
function CosmicHeader({ name = "Traveler", xp = 0 }: { name?: string; xp?: number }) {
  const [guide, setGuide] = useState<any>(null);

  // Load selected guide from AsyncStorage
  useEffect(() => {
    const loadGuide = async () => {
      const storedId = await AsyncStorage.getItem("selectedGuideId");
      if (storedId) {
        const found = ALL_GUIDES.find((g) => g.id === storedId);
        if (found) setGuide(found);
      }
    };
    loadGuide();
  }, []);

  // Compute level info
  let current = LEVELS[0];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) current = LEVELS[i];
  }
  const nextIndex = Math.min(LEVELS.findIndex((l) => l.name === current.name) + 1, LEVELS.length - 1);
  const next = LEVELS[nextIndex];
  const progress = next.threshold === current.threshold ? 1 : (xp - current.threshold) / (next.threshold - current.threshold);

  // XP bar animation
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, { toValue: progress, duration: 900, useNativeDriver: false }).start();
  }, [progress]);
  const widthInterp = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  // Glow pulse animation
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.6] });

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Animated.View style={[styles.avatarWrap, { shadowOpacity: glow }]}>
            <Image
              //source={guide?.image || require("../../assets/images/guide1.png")}
              source={require("../../assets/images/guide1.png")}
              style={styles.avatar}
            />
          </Animated.View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.hello}>Welcome back,</Text>
            <Text style={styles.name}>{name}</Text>
            {guide && <Text style={styles.small}>{`Guide: ${guide.name} • Aligning your stars`}</Text>}
          </View>
        </View>
        <Pressable style={[glassStyle.card, styles.profileMini]}>
          <Ionicons name="sparkles" size={20} color={colors.gold} />
        </Pressable>
      </View>

      {/* MAIN XP PROGRESS BAR (identity anchor) */}
      <View style={{ height: 48, marginTop: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.02)", padding: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
          <Text style={{ color: colors.white, fontWeight: "800" }}>{current.name}</Text>
          <Text style={{ color: colors.light }}>{xp} XP • Next: {next.threshold}</Text>
        </View>
        <View style={{ height: 10, backgroundColor: "#0b0711", borderRadius: 8, overflow: "hidden" }}>
          <Animated.View style={{ width: widthInterp, height: "100%", backgroundColor: colors.gold, borderRadius: 8 }} />
        </View>
      </View>
    </View>
  );
}

/* ---------- TapToTalkOrb (promoted + stronger visuals) ---------- */
function TapToTalkOrb({ onPress }: { onPress: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const voice = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1.14, duration: 900, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true })])).start();
    Animated.loop(Animated.sequence([Animated.timing(voice, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(voice, { toValue: 0, duration: 1200, useNativeDriver: true })])).start();
  }, []);

  const rippleScale = voice.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const rippleOpacity = voice.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0] });

  return (
    <View style={{ alignItems: "center", marginVertical: 18 }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: 120,
          borderWidth: 1,
          borderColor: "rgba(255,215,0,0.08)",
          transform: [{ scale: rippleScale }],
          opacity: rippleOpacity,
        }}
      />
      <Animated.View
        style={{
          width: 160,
          height: 160,
          borderRadius: 80,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: colors.gold,
          shadowOpacity: 0.55,
          shadowRadius: 18,
          transform: [{ scale: pulse }],
          backgroundColor: "rgba(255,215,0,0.06)",
        }}
      >
        <Pressable
          onPress={onPress}
          style={{
            width: 124,
            height: 124,
            borderRadius: 62,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,215,0,0.18)",
            borderWidth: 1,
            borderColor: "rgba(255,215,0,0.28)",
          }}
        >
          <Ionicons name="mic" size={40} color={colors.gold} />
          <Text style={{ color: colors.gold, fontSize: 10, fontWeight: "900", marginTop: 8 }}>Ask the Cosmos</Text>
        </Pressable>
      </Animated.View>
      <Text style={{ color: colors.light, fontSize: 12, marginTop: 8 }}>Tap to start a voice chat with your Selena</Text>
    </View>
  );
}

/* ---------- HoroscopeWheelServices (original, unchanged) ---------- */
function HoroscopeWheelServices({ services, onSelect }: { services: any[]; onSelect: (s: any) => void }) {
  const radius = Math.min(width * 0.36, 180);
  const nodeSize = 72;
  const wheelSize = radius * 2;
  const centerInWheel = wheelSize / 2;

  const nodes = services.map((s, i) => {
    const angle = (i / services.length) * 2 * Math.PI - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const left = centerInWheel + x - nodeSize / 2;
    const top = centerInWheel + y - nodeSize / 2;
    return { left, top, label: s.label, key: s.key, item: s };
  });

  const highlightOffset = 4;
  const highlightPos = useRef(new Animated.ValueXY({ x: nodes[0].left - highlightOffset, y: nodes[0].top - highlightOffset })).current;
  const highlightScale = useRef(new Animated.Value(1)).current;

  const [activeIndex, setActiveIndex] = useState(0);
  const [label, setLabel] = useState(services[0]?.label ?? "");

  useEffect(() => {
    highlightPos.setValue({ x: nodes[0].left - highlightOffset, y: nodes[0].top - highlightOffset });
    setLabel(nodes[0].label);

    const id = setInterval(() => {
      setActiveIndex((p) => (p + 1) % services.length);
    }, 2600);

    return () => clearInterval(id);
  }, [services]);

  useEffect(() => {
    const target = nodes[activeIndex];
    if (!target) return;
    Animated.parallel([
      Animated.spring(highlightPos, { toValue: { x: target.left - highlightOffset, y: target.top - highlightOffset }, useNativeDriver: true, speed: 20, bounciness: 10 }),
      Animated.sequence([Animated.timing(highlightScale, { toValue: 1.12, duration: 220, useNativeDriver: true }), Animated.timing(highlightScale, { toValue: 1, duration: 260, useNativeDriver: true })]),
    ]).start();

    setLabel(target.label);
  }, [activeIndex]);

  const handleNodePress = (index: number) => {
    setActiveIndex(index);
    onSelect && onSelect(services[index]);
  };

  return (
    <View style={{ alignItems: "center", marginVertical: 18 }}>
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: colors.gold, fontSize: 14, fontWeight: "900", letterSpacing: 0.6 }}>Exploration Wheel</Text>
        <Text style={{ color: colors.white, fontSize: 18, fontWeight: "900", marginTop: 6 }}>{label}</Text>
        <Text style={{ color: colors.light, fontSize: 12, marginTop: 4 }}>Tap a node — or wait for the highlight to move</Text>
      </View>

      <View style={{ marginTop: 48, width: radius * 2 - 12, height: radius * 2 - 12, borderRadius: (radius * 2 - 12) / 2, borderWidth: 1.5, borderColor: "rgba(255,215,0,0.08)", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.01)" }}>
        <View style={{ position: "absolute", width: wheelSize + 16, height: wheelSize + 16, borderRadius: (wheelSize + 16) / 2, borderWidth: 1, borderColor: "rgba(255,215,0,0.04)" }} />
        <View style={{ width: wheelSize, height: wheelSize, position: "relative" }}>
          <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: nodeSize + 8, height: nodeSize + 8, borderRadius: (nodeSize + 8) / 2, backgroundColor: "rgba(255,215,0,0.08)", transform: [{ translateX: highlightPos.x }, { translateY: highlightPos.y }, { scale: highlightScale }], shadowColor: colors.gold, shadowOpacity: 0.12, shadowRadius: 10 }} />
          {nodes.map((n, idx) => (
            <Animated.View key={n.key} style={{ position: "absolute", left: n.left, top: n.top, width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2, justifyContent: "center", alignItems: "center", backgroundColor: activeIndex === idx ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: activeIndex === idx ? "rgba(255,215,0,0.22)" : "rgba(255,215,0,0.10)", shadowColor: colors.gold, shadowOpacity: activeIndex === idx ? 0.22 : 0.12, shadowRadius: activeIndex === idx ? 12 : 6 }}>
              <Pressable onPress={() => handleNodePress(idx)} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name={services[idx].icon} size={22} color={colors.gold} />
                <Text style={{ color: colors.white, fontSize: 11, fontWeight: "700", marginTop: 6, textAlign: "center", width: 78 }}>{services[idx].label}</Text>
              </Pressable>
            </Animated.View>
          ))}
          <View style={{ position: "absolute", left: wheelSize / 2 - 42, top: wheelSize / 2 - 42, width: 84, height: 84, borderRadius: 42, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,215,0,0.06)", borderWidth: 1, borderColor: "rgba(255,215,0,0.12)", shadowColor: colors.gold, shadowOpacity: 0.22, shadowRadius: 10 }}>
            <Text style={{ color: colors.gold, fontWeight: "900" }}>Services</Text>
          </View>
        </View>
      </View>

      <Text style={{ color: colors.light, fontSize: 12, marginTop: 58 }}>Ancient systems & modern readings</Text>
    </View>
  );
}

/* ---------- Full Cosmic Dashboard (reordered + enhanced) ---------- */
export default function CosmicDashboard() {
  const router = useRouter();

  const predictions = useMemo(
    () => [
      { id: makeId("p"), title: "Creativity Surge", value: "High", note: "Capture your idea today and write it down. Create a small, next-step action so the idea has somewhere to go." },
      { id: makeId("p"), title: "Social Pulse", value: "Medium", note: "Reach out to a friend; a short message can open a window of meaningful conversation." },
      { id: makeId("p"), title: "Intuition Boost", value: "Strong", note: "Trust your instincts — small nudges matter. Quiet time will sharpen your inner voice." },
      { id: makeId("p"), title: "Luck Window", value: "Open", note: "Time to try something new. Put your work out there — small risks may bring unexpected rewards." },
    ],
    []
  );

  const services = useMemo(
    () => [
      { key: "kundali", label: "Prashna Kundali", icon: "star" },
      { key: "tarot", label: "Tarot  Reading", icon: "card" },
      { key: "palm", label: "Palmistry", icon: "hand-left" },
      { key: "vastu", label: "Vastu  Shastra", icon: "document-text" },
      { key: "numerology", label: "Numerology", icon: "calculator" },
      { key: "birthchart", label: "Birth Chart", icon: "ellipse" },
      { key: "iching", label: "I Ching", icon: "grid" },
      { key: "luoshu", label: "Luoshu     Grid", icon: "layers" },
    ],
    []
  );

  // ----------- XP / Streak state (persistent) -----------
  const [xp, setXp] = useState<number>(420);
  const [streak, setStreak] = useState<number>(5);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(120);

  useEffect(() => {
    (async () => {
      try {
        const storedXp = await AsyncStorage.getItem("cosmic_xp");
        const storedStreak = await AsyncStorage.getItem("cosmic_streak");
        const storedLast = await AsyncStorage.getItem("cosmic_last");
        const storedCoins = await AsyncStorage.getItem("cosmic_coins");
        if (storedXp) setXp(parseInt(storedXp, 10));
        if (storedStreak) setStreak(parseInt(storedStreak, 10));
        if (storedLast) setLastLogin(storedLast);
        if (storedCoins) setCoins(parseInt(storedCoins, 10));

        const today = todayKey();
        if (storedLast !== today) {
          if (storedLast) {
            const [y, m, d] = storedLast.split("-").map((s) => parseInt(s, 10));
            const prev = new Date(y, m - 1, d);
            const now = new Date();
            const diff = Math.floor((now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              const ns = (storedStreak ? parseInt(storedStreak, 10) : streak) + 1;
              setStreak(ns);
              await AsyncStorage.setItem("cosmic_streak", ns.toString());
            } else {
              const ns = 1;
              setStreak(ns);
              await AsyncStorage.setItem("cosmic_streak", ns.toString());
            }
          } else {
            setStreak(1);
            await AsyncStorage.setItem("cosmic_streak", "1");
          }
          await AsyncStorage.setItem("cosmic_last", today);
          setLastLogin(today);
        }
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addXp = async (n: number) => {
    const nx = Math.max(0, xp + n);
    setXp(nx);
    await AsyncStorage.setItem("cosmic_xp", nx.toString());
  };

  const handleUnlockMystery = async () => {
    await addXp(25);
    const newCoins = Math.max(0, coins - 10);
    setCoins(newCoins);
    await AsyncStorage.setItem("cosmic_coins", newCoins.toString());
  };

  const handleQuestComplete = async (id: string) => {
    if (id === "q1") await addXp(10);
    if (id === "q2") await addXp(20);
    if (id === "q3") await addXp(25);
    const newCoins = coins + 5;
    setCoins(newCoins);
    await AsyncStorage.setItem("cosmic_coins", newCoins.toString());
  };

  const quickXp = async () => {
    await addXp(100);
  };

  return (
    <LinearGradient colors={["#1d0234ff", "#34025cff"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 110 }}>
          {/* Header now contains main XP bar */}
          <CosmicHeader name="Vinay" xp={xp} />

          {/* Primary action: promoted TapToTalk orb */}
          <TapToTalkOrb
            onPress={() => {
              addXp(30);
              router.push("../tabs/chat");
            }}
          />

          {/* Top dynamic cluster */}
          <View style={{ marginBottom: 6 }}>
            <EnergyMeter percent={0.72} />
          </View>

          {/* Today's predictions & horoscope are moved ABOVE quests */}
          <Text style={styles.sectionTitle}>Today's Predictions</Text>
          <SwipeableInsights data={predictions} />
          <DailyHoroscope />

          {/* Quests come after predictions/horoscope */}
          <QuestsPanel onComplete={handleQuestComplete} />

          {/* Progress & streak summary (keeps StreakXpBar) */}
          <StreakXpBar xp={xp} />

          {/* developer quick XP */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 }}>
            <Pressable onPress={quickXp} style={{ padding: 8 }}>
              <Text style={{ color: colors.light, fontSize: 12 }}>+100 XP (dev)</Text>
            </Pressable>
          </View>

          {/* Wheel */}
          <HoroscopeWheelServices services={services} onSelect={(s) => router.push(`../tabs/${s.key}`)} />

          {/* Planetary highlight moved to bottom, just above Wallet */}
          <PlanetaryHighlight />

          {/* Wallet */}
          <Wallet coins={coins} premium={30} onBuy={() => {}} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    shadowColor: colors.gold,
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  guideName: {
  fontSize: 16,
  fontWeight: "600",
  color: "#fff",
  marginTop: 4,
},
  avatar: { width: 64, height: 64, borderRadius: 12 },
  hello: { color: colors.light, fontSize: 13, fontWeight: "600" },
  name: { color: colors.white, fontSize: 20, fontWeight: "900" },
  small: { color: colors.light, fontSize: 12, opacity: 0.9, marginTop: 2 },
  profileMini: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: "800", marginTop: 16, marginBottom: 6 },
});
