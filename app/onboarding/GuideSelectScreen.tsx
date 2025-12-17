import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Added
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground, ImageSourcePropType, Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, glassStyle, gradients, spacing } from "../../theme";

const { width } = Dimensions.get("window");

type Guide = {
  id: string;
  name: string;
  role: string;
  image: ImageSourcePropType; // <-- allow require() images
  rating?: number;
  sessions?: number;
};

const ALL_GUIDES: Guide[] = [
  { id: "1", name: "Orion Luminar", role: "Cosmic Healer", image: require("../../assets/images/guides/guide1-lady-Asian.jpg"), rating: 4.9, sessions: 1200 },
  { id: "2", name: "Lyra Nova", role: "Mind Alignment", image: require("../../assets/images/guides/guide2-lady-Asian.jpg"), rating: 4.8, sessions: 980 },
  { id: "3", name: "Seren Astra", role: "Spiritual Energy", image: require("../../assets/images/guides/guide3-Male-Asian.jpg"), rating: 5.0, sessions: 1450 },
  { id: "4", name: "Caelum Orionis", role: "Astro Meditation", image: require("../../assets/images/guides/guide4-Male-Asian.jpg"), rating: 4.7, sessions: 860 },
  { id: "5", name: "Nova Zenith", role: "Aura Cleansing", image: require("../../assets/images/guides/guide5-female-Asian.jpg"), rating: 4.9, sessions: 1012 },
  { id: "6", name: "Altair Solace", role: "Celestial Energy", image: require("../../assets/images/guides/guide6-male-Asian.jpg"), rating: 4.8, sessions: 790 },
  { id: "7", name: "Vega Lumen", role: "Mind Alignment", image: require("../../assets/images/guides/guide7-female-Asian.jpg"), rating: 4.9, sessions: 1100 },
  { id: "8", name: "Astra Nyx", role: "Spiritual Energy", image: require("../../assets/images/guides/guide8-male-Asian.jpg"), rating: 4.7, sessions: 660 },
  { id: "9", name: "Rigel Dawn", role: "Cosmic Healer", image: require("../../assets/images/guides/guide9-female-Asian.jpg"), rating: 4.8, sessions: 905 },
  { id: "10", name: "Selene Quill", role: "Astro Meditation", image: require("../../assets/images/guides/guide10-female-Asian.jpg"), rating: 4.1, sessions: 330 },
  { id: "11", name: "Selene Quill", role: "Mind Alignment", image: require("../../assets/images/guides/guide11-male-Asian.jpg"), rating: 4.4, sessions: 1130 },
  { id: "12", name: "Selene Quill", role: "Cosmic Healer", image: require("../../assets/images/guides/guide12-male-Asian.jpg"), rating: 4.2, sessions: 430 },
  { id: "13", name: "Selene Quill", role: "Celestial Energy", image: require("../../assets/images/guides/guide13-male-Asian.jpg"), rating: 4.1, sessions: 230 },
  { id: "14", name: "Selene Quill", role: "Astro Meditation", image: require("../../assets/images/guides/guide14-female-Asian.jpg"), rating: 4.6, sessions: 130 },
  { id: "15", name: "Selene Quill", role: "Spiritual Energy", image: require("../../assets/images/guides/guide15-female-Asian.jpg"), rating: 4.9, sessions: 133 },
  { id: "16", name: "Selene Quill", role: "Astro Meditation", image: require("../../assets/images/guides/guide16-male-Asian.jpg"), rating: 4.7, sessions: 233 },
  { id: "17", name: "Selene Quill", role: "Aura Cleansing", image: require("../../assets/images/guides/guide17-male-Asian.jpg"), rating: 3.9, sessions: 328 },
  { id: "18", name: "Selene Quill", role: "Cosmic Healer", image: require("../../assets/images/guides/guide18-male-Asian.jpg"), rating: 3.8, sessions: 926 },
  { id: "19", name: "Selene Quill", role: "Astro Meditation", image: require("../../assets/images/guides/guide19-male-Asian.jpg"), rating: 4.0, sessions: 120 },
  { id: "20", name: "Selene Quill", role: "Celestial Energy", image: require("../../assets/images/guides/guide20-female-Asian.jpg"), rating: 4.9, sessions: 745 },

];


const CATEGORIES = [
  "All",
  "Cosmic Healer",
  "Mind Alignment",
  "Spiritual Energy",
  "Astro Meditation",
  "Aura Cleansing",
  "Celestial Energy",
] as const;

const CARD_WIDTH = width * 0.78;
const CARD_SPACING = spacing.md;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
const SIDE_SPACER = (width - CARD_WIDTH) / 2;

export default function GuideSelectScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scrollX = useRef(new Animated.Value(0)).current;
  const heroRef = useRef<FlatList<Guide>>(null);

  const pulse = useRef(new Animated.Value(1)).current;

  // ✅ Load selected guide from AsyncStorage on mount
  useEffect(() => {
const loadSelectedGuide = async () => {
  try {
    const savedId = await AsyncStorage.getItem("selectedGuideId");
    if (savedId) {
      setSelectedId(savedId);
    }
  } catch (e) {
    console.log("Failed to load selected guide:", e);
  }
};
    loadSelectedGuide();
  }, []);

  // ✅ Save selected guide object to AsyncStorage whenever it changes
  useEffect(() => {
    if (!selectedId) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

const saveSelection = async () => {
  try {
    if (selectedId) {
      await AsyncStorage.setItem("selectedGuideId", selectedId);
    }
  } catch (e) {
    console.log("Failed to save selected guide:", e);
  }
};

    saveSelection();

    pulse.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [selectedId]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return ALL_GUIDES;
    return ALL_GUIDES.filter(g => g.role === activeCategory);
  }, [activeCategory]);

  const trending = useMemo(() => [...ALL_GUIDES].sort((a, b) => (b.sessions ?? 0) - (a.sessions ?? 0)).slice(0, 7), []);
  const freshFaces = useMemo(() => [...ALL_GUIDES].reverse().slice(0, 7), []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    const mid = viewableItems.find(v => v.index !== null && v.isViewable);
    if (mid?.item?.id) {
      setSelectedId(prev => prev ?? mid.item.id);
    }
  }).current;

  const handleContinue = () => {
    router.push("/onboarding/BirthDetailsScreen");
  };

  const renderHeroCard = ({ item, index }: { item: Guide; index: number }) => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const rotate = scrollX.interpolate({
      inputRange,
      outputRange: ["-6deg", "0deg", "6deg"],
      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [12, 0, 12],
      extrapolate: "clamp",
    });

    const isSelected = selectedId === item.id;

    return (
      <View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}>
        <Animated.View
          style={[
            styles.cardShadowWrap,
            {
              transform: [
                { translateY },
                { scale: isSelected ? Animated.multiply(scale, pulse) : scale },
                { rotate },
              ],
            },
          ]}
        >
          <Pressable onPress={() => setSelectedId(item.id)} hitSlop={8}>
            <ImageBackground
              source={item.image }
              imageStyle={{ borderRadius: 32 }}
              style={[styles.heroCard]}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.65)"]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.glassPill, { top: 12, left: 12 }]}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>{item.role}</Text>
              </View>
              <View style={[styles.glassPill, { top: 12, right: 12 }]}>
                <Text style={styles.pillText}>★ {(item.rating ?? 4.8).toFixed(1)}</Text>
              </View>
              <View style={styles.bottomInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {(item.sessions ?? 0).toLocaleString()} sessions • {(item.rating ?? 4.8).toFixed(1)} rating
                </Text>
                <LinearGradient
                  colors={gradients.gold as [any, any]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.selectBtn,
                    isSelected && { shadowColor: colors.gold, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8 },
                  ]}
                >
                  <Text style={styles.selectText}>{isSelected ? "Selected" : "Select"}</Text>
                </LinearGradient>
              </View>
            </ImageBackground>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const SmallCard = ({ g }: { g: Guide }) => (
    <Pressable onPress={() => { setSelectedId(g.id); setActiveCategory("All"); }} style={{ marginRight: spacing.md }}>
      <View style={styles.smallCard}>
        <Image source={g.image} style={styles.smallImg} />
        <Text numberOfLines={1} style={styles.smallName}>{g.name}</Text>
        <Text numberOfLines={1} style={styles.smallRole}>{g.role}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={colors.backgroundGradient as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={[]}
          ListHeaderComponent={
            <>
              <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
                <Text style={[glassStyle.header, { textAlign: "center" }]}>Choose Your Guide</Text>
              
              </View>

              <FlatList
                data={CATEGORIES as unknown as string[]}
                keyExtractor={(k) => k}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}
                ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
                renderItem={({ item }) => {
                  const active = activeCategory === item;
                  return (
                    <TouchableOpacity onPress={() => setActiveCategory(item as any)} activeOpacity={0.9}>
                      <LinearGradient
                        colors={active ? (gradients.gold as [any, any]) : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.08)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={[
                          styles.chip,
                          active ? { borderColor: "transparent" } : { borderColor: colors.glassBorder, borderWidth: 1 },
                        ]}
                      >
                        <Text style={[styles.chipText, active && { color: colors.black as string, fontWeight: "800" }]}>{item}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }}
              />

              <Animated.FlatList
                ref={heroRef}
                data={filtered}
                keyExtractor={(it) => it.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                bounces={false}
                contentContainerStyle={{ paddingHorizontal: SIDE_SPACER }}
                renderItem={renderHeroCard}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                style={{ paddingVertical: spacing.md }}
              />

              {/* Dots inside hero area */}
              <View style={{ marginTop: -spacing.md, marginBottom: spacing.lg }}>
                <View style={styles.dotsRow}>
                  {filtered.map((_, i) => {
                    const inputRange = [ (i - 1) * SNAP_INTERVAL, i * SNAP_INTERVAL, (i + 1) * SNAP_INTERVAL ];
                    const dotScale = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.8, 1.35, 0.8],
                      extrapolate: "clamp",
                    });
                    const dotOpacity = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.35, 1, 0.35],
                      extrapolate: "clamp",
                    });
                    return (
                      <Animated.View key={i} style={[styles.dot, { transform: [{ scale: dotScale }], opacity: dotOpacity }]} />
                    );
                  })}
                </View>
              </View>

              <Section title="🔥 Trending Mentors">
                <FlatList
                  data={trending}
                  keyExtractor={(g) => g.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                  renderItem={({ item }) => <SmallCard g={item} />}
                />
              </Section>

              <Section title="✨ New on Astro Quest">
                <FlatList
                  data={freshFaces}
                  keyExtractor={(g) => g.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                  renderItem={({ item }) => <SmallCard g={item} />}
                />
              </Section>
            </>
          }
          renderItem={null}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />

        {selectedId && (
          <View style={styles.bottomBarWrap} pointerEvents="box-none">
            <View style={[glassStyle.tabBar, styles.bottomBar]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={ALL_GUIDES.find(g => g.id === selectedId)?.image}
                    style={styles.avatar}
                  />
                </View>
                <View>
                  <Text style={styles.bottomTitle}>{ALL_GUIDES.find(g => g.id === selectedId)?.name}</Text>
                  <Text style={styles.bottomSub}>{ALL_GUIDES.find(g => g.id === selectedId)?.role}</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.9} onPress={handleContinue}>
                <LinearGradient
                  colors={gradients.gold as [any, any]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.ctaBtn]}
                >
                  <Text style={styles.ctaText}>Continue →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ paddingTop: spacing.md, paddingBottom: spacing.lg }}>
    <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm, flexDirection: "row", alignItems: "center" }}>
      <Text style={[glassStyle.subHeader, { fontWeight: "800" }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  cardShadowWrap: {
    borderRadius: 32,
    shadowColor: colors.shadowDark as string,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  heroCard: {
    height: width * 1.05,
    borderRadius: 32,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  glassPill: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder as string,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent as string,
  },
  pillText: {
    color: colors.white as string,
    fontWeight: "700",
    fontSize: 12,
  },
  bottomInfo: {
    padding: spacing.lg,
  },
  name: {
    color: colors.white as string,
    fontSize: 28,
    fontWeight: "900",
  },
  meta: {
    color: colors.accent as string,
    opacity: 0.9,
    marginTop: 2,
    marginBottom: spacing.md,
    fontSize: 13.5,
    fontWeight: "600",
  },
  selectBtn: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 18,
  },
  selectText: {
    color: colors.black as string,
    fontWeight: "800",
    fontSize: 16,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  chipText: {
    color: colors.white as string,
    fontSize: 13.5,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent as string,
  },

  smallCard: {
    width: 120,
    backgroundColor: colors.primary as string,
    borderRadius: 22,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder as string,
    shadowColor: colors.shadowDark as string,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  smallImg: {
    width: "100%",
    height: 90,
    borderRadius: 16,
    marginBottom: spacing.xs,
  },
  smallName: {
    color: colors.white as string,
    fontWeight: "800",
    fontSize: 13.5,
  },
  smallRole: {
    color: colors.accent as string,
    fontSize: 11.5,
    marginTop: 2,
  },

  bottomBarWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  bottomBar: {
    height: 92,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#23023fff",
    borderTopWidth: 1,
    borderColor: colors.glassBorder as string,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.accent as string,
    overflow: "hidden",
    backgroundColor: colors.primary as string,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  bottomTitle: {
    color: colors.white as string,
    fontSize: 16,
    fontWeight: "900",
  },
  bottomSub: {
    color: colors.accent as string,
    fontSize: 12.5,
    marginTop: 2,
  },
  ctaBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    shadowColor: colors.gold as string,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: colors.black as string,
    fontWeight: "900",
    fontSize: 10,
  },
});
