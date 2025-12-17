// BirthDetailsScreen.tsx (personalized flow + progress bar)
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageSourcePropType,
  Keyboard,
  KeyboardAvoidingView, Modal, Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { ALL_GUIDES } from "../../data/guides";
import { colors, glassStyle, gradients } from "../../theme";

const { width } = Dimensions.get("window");

type GuideParam = {
  image?: ImageSourcePropType;
  uri?: string;
  name?: string;
  role?: string;
  id?: string;
};

// Initial poetic messages
const messages = {
  name: [
    "Every name carries a secret vibration of the cosmos...",
    "The stars hum your name in gentle harmony...",
    "Destiny listens when your name is spoken.",
  ],
  birthDate: (name: string) => [
    `Welcome ${name}, let's mark the day the stars welcomed you...`,
    `Hey ${name}, the cosmos remembers your arrival.`,
    `The universe whispers to you, ${name}, about your birth date.`,
  ],
  birthTime: (name: string, date: Date) => [
    `${name}, born on ${date.toLocaleDateString()}, let's capture your cosmic hour...`,
    `The heavens aligned at your arrival, ${name}. When exactly?`,
    `${name}, the universe was watching the clock as you were born.`,
  ],
  birthPlace: (name: string, date: Date, time: Date) => [
    `Where on Earth were you born, ${name}?`,
    `${name}, tell me the place that witnessed your arrival.`,
    `Every city carries your cosmic fingerprint, ${name}.`,
  ],
  final: (name: string, date: Date, time: Date, place: string) => [
    `${name}, born on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}, in ${place}…`,
    `The cosmos has engraved your story: ${name}, ${place}, ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}.`,
    `Everything aligns now, ${name}. Are you ready to reveal your stars?`,
  ],
};

export default function BirthFlowScreen() {
  const [step, setStep] = useState(0); // step 0: Name
  const [message, setMessage] = useState("");

  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  // Birth time inputs
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [hourInput, setHourInput] = useState("");
  const [minuteInput, setMinuteInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [ampm, setAmpm] = useState<"AM" | "PM" | "">("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [birthPlace, setBirthPlace] = useState("");

  const [savedGuide, setSavedGuide] = useState<GuideParam | null>(null);
  const [imageError, setImageError] = useState(false);
  const [resolvedSource, setResolvedSource] = useState<any>(
    require("../../assets/guide-placeholder.png")
  );
  const [validatingRemote, setValidatingRemote] = useState(false);

  const router = useRouter();

  const bob = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const orbs = useRef(
    Array.from({ length: 6 }).map(() => new Animated.Value(Math.random()))
  ).current;

  // Load saved guide
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const storedId = await AsyncStorage.getItem("selectedGuideId");
        if (storedId) {
          const guide = ALL_GUIDES.find((g) => g.id === storedId);
          if (guide) setSavedGuide(guide);
        }
      } catch (e) {
        console.log("Failed to fetch saved guide:", e);
      }
    };
    fetchGuide();
  }, []);

  // Load saved data if available
  useEffect(() => {
    const loadData = async () => {
      const name = await AsyncStorage.getItem("userName");
      const date = await AsyncStorage.getItem("birthDate");
      const time = await AsyncStorage.getItem("birthTime");
      const place = await AsyncStorage.getItem("birthPlace");

      if (name) setUserName(name);
      if (date) {
const [y, m, d] = date.split("-").map(Number);
const parsed = new Date(y, m - 1, d);
  if (!isNaN(parsed.getTime())) {
    setBirthDate(parsed);
  } else {
    console.log("Invalid stored birthDate:", date);
    setBirthDate(null);
  }
}

if (time) {
  const parsed = new Date(time);
  if (!isNaN(parsed.getTime())) {
    setBirthTime(parsed);
    setHourInput(String(parsed.getHours() % 12 || 12));
    setMinuteInput(String(parsed.getMinutes()).padStart(2, "0"));
    setSecondInput(String(parsed.getSeconds()).padStart(2, "0"));
    setAmpm(parsed.getHours() >= 12 ? "PM" : "AM");
  } else {
    console.log("Invalid stored birthTime:", time);
    setBirthTime(null);
  }
}

      if (place) setBirthPlace(place);
    };
    loadData();
  }, []);

  // Resolve guide image
  useEffect(() => {
    setImageError(false);
    setValidatingRemote(false);
    const localPlaceholder = require("../../assets/guide-placeholder.png");

    if (!savedGuide) {
      setResolvedSource(localPlaceholder);
      return;
    }

    const candidate = savedGuide.image ?? savedGuide.uri;

    if (typeof candidate === "number") {
      setResolvedSource(candidate);
      return;
    }

    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
        setValidatingRemote(true);
        Image.getSize(
          trimmed,
          (w, h) => {
            setValidatingRemote(false);
            setResolvedSource({ uri: trimmed });
          },
          () => {
            setValidatingRemote(false);
            setImageError(true);
            setResolvedSource(localPlaceholder);
          }
        );
        return;
      }
      setResolvedSource(localPlaceholder);
      return;
    }
    setResolvedSource(localPlaceholder);
  }, [savedGuide]);

  // Personalized message selection
  useEffect(() => {
    let pool: string[] = [];
    switch (step) {
      case 0:
        pool = messages.name;
        break;
      case 1:
        pool = userName ? messages.birthDate(userName) : messages.name;
        break;
      case 2:
        pool =
          userName && birthDate
            ? messages.birthTime(userName, birthDate)
            : messages.name;
        break;
      case 3:
        pool =
          userName && birthDate && birthTime
            ? messages.birthPlace(userName, birthDate, birthTime)
            : messages.name;
        break;
      case 4:
        pool =
          userName && birthDate && birthTime && birthPlace
            ? messages.final(userName, birthDate, birthTime, birthPlace)
            : messages.name;
        break;
    }
    if (pool.length > 0) {
      const random = pool[Math.floor(Math.random() * pool.length)];
      setMessage(random);
    } else setMessage("");
  }, [step, userName, birthDate, birthTime, birthPlace]);

  // Animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
    orbs.forEach((val, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: 3000 + idx * 300,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 3000 + idx * 300,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  }, []);

  const bobInterp = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const glowInterp = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.28],
  });

  const saveStepData = async () => {
    try {
      if (step === 0 && userName)
        await AsyncStorage.setItem("userName", userName);
      if (step === 1 && birthDate)
        await AsyncStorage.setItem("birthDate", birthDate.toISOString().split("T")[0]); 
      if (step === 2 && birthTime)
        await AsyncStorage.setItem("birthTime", birthTime.toISOString());
      if (step === 3 && birthPlace)
        await AsyncStorage.setItem("birthPlace", birthPlace);
    } catch (e) {
      console.log("Error saving data:", e);
    }
  };

  const progressPercent = ((step + 1) / 5) * 100;

  // Build birth time object when inputs change
  useEffect(() => {
    if (!hourInput && !minuteInput && !ampm) {
      setBirthTime(null);
      return;
    }
    const h = parseInt(hourInput, 10);
    const m = parseInt(minuteInput, 10);
    const s = parseInt(secondInput, 10);
    if (isNaN(h) || isNaN(m) || isNaN(s) || !ampm) return;

    let hour24 = h % 12;
    if (ampm === "PM") hour24 += 12;

    const dt = birthTime ? new Date(birthTime) : new Date();
    dt.setHours(hour24, m % 60, s % 60, 0);
    setBirthTime(dt);
  }, [hourInput, minuteInput,secondInput, ampm]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <LinearGradient colors={gradients.cosmic} style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
        />
      </View>

      {/* faint radial rim */}
      <Animated.View
        style={[
          styles.rim,
          {
            opacity: glowInterp,
            shadowRadius: glowInterp.interpolate({
              inputRange: [0.12, 0.28],
              outputRange: [20, 44],
            }),
          },
        ]}
        pointerEvents="none"
      />

      {/* drifting orbs */}
      {orbs.map((val, i) => {
        const left = (i + 1) * (width / (orbs.length + 1)) - 30;
        const translateY = val.interpolate({
          inputRange: [0, 1],
          outputRange: [Math.sin(i) * 6, Math.cos(i) * -18],
        });
        const scale = val.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.1],
        });
        const opacity = val.interpolate({
          inputRange: [0, 1],
          outputRange: [0.12, 0.28],
        });
        return (
          <Animated.View
            key={`orb-${i}`}
            style={[
              styles.orb,
              { left, transform: [{ translateY }, { scale }], opacity },
            ]}
          />
        );
      })}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.centered}
      >
        {/* GUIDE CARD ROW */}
        <View style={styles.guideRow}>
          <Animated.View
            style={[
              styles.portraitWrap,
              {
                transform: [
                  { translateY: bobInterp },
                  {
                    scale: bob.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                ],
                shadowOpacity: 0.65,
                shadowRadius: glowInterp.interpolate({
                  inputRange: [0.12, 0.28],
                  outputRange: [8, 24],
                }),
              },
            ]}
          >
            <View style={styles.glowRing} />
            <Image
              source={resolvedSource}
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              style={styles.portrait}
            />
          </Animated.View>

          <View style={styles.speechWrap}>
            <View style={[glassStyle.shadowCard, styles.speechCard]}>
              <Text style={[glassStyle.badgeText, { marginBottom: 8 }]}>
                {savedGuide?.name ?? "Your Guide"}
              </Text>
              <Text style={[glassStyle.bodyText, { fontStyle: "italic" }]}>
                {message}
              </Text>
              {imageError && (
                <Text
                  style={{
                    color: colors.accent,
                    marginTop: 6,
                    fontSize: 12,
                  }}
                >
                  (guide image not reachable — using placeholder)
                </Text>
              )}
              {validatingRemote && (
                <Text
                  style={{
                    color: colors.accent,
                    marginTop: 6,
                    fontSize: 12,
                  }}
                >
                  (validating guide image...)
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Headlines */}
        {step === 0 && (
          <Text style={[glassStyle.subHeader, styles.headline]}>
            What name did the cosmos whisper for you?
          </Text>
        )}
        {step === 1 && (
          <Text style={[glassStyle.subHeader, styles.headline]}>
            When did the cosmos{"\n"}choose your arrival?
          </Text>
        )}
        {step === 2 && (
          <Text style={[glassStyle.subHeader, styles.headline]}>
            At what hour did the universe{"\n"}greet you?
          </Text>
        )}
        {step === 3 && (
          <Text style={[glassStyle.subHeader, styles.headline]}>
            Where on Earth did the heavens{"\n"}place you?
          </Text>
        )}
        {step === 4 && (
          <View style={{ alignItems: "center", marginTop: 12 }}>
    <Text style={[glassStyle.subHeader, styles.headline]}>
      ✨ All your details are aligned ✨
    </Text>

    <View style={[glassStyle.card, { marginTop: 16, padding: 12, width: "100%" }]}>
      <Text style={glassStyle.smbodyText}> Name: {userName}</Text>
      <Text style={glassStyle.smbodyText}>
        Birth Date:{" "}
        {birthDate
          ? birthDate.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Not set"}
      </Text>
      <Text style={glassStyle.smbodyText}>
        Time:{" "}
        {birthTime
          ? birthTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "Not set"}
      </Text>
      <Text style={glassStyle.smbodyText}>Place: {birthPlace || "Not set"}</Text>
    </View>
  </View>

        )}

        {/* Input Steps */}
        {step === 0 && (
          <View style={[styles.inputBlock, glassStyle.card]}>
            <Text style={glassStyle.badgeText}>Enter Your Name</Text>
            <View style={[glassStyle.input, { width: "100%", marginTop: 12 }]}>
              <TextInput
                placeholder="Your Name"
                placeholderTextColor={colors.accent}
                style={{ color: colors.white }}
                value={userName}
                onChangeText={setUserName}
              />
            </View>
          </View>
        )}

{step === 1 && (
  <View style={[styles.inputBlock, glassStyle.card]}>
    <Text style={glassStyle.badgeText}>Select your Birth Date</Text>

    <TouchableOpacity
      style={[glassStyle.button, styles.inputButton]}
      onPress={() => setShowDatePicker(true)}
    >
      <Ionicons name="calendar-outline" size={14} color={colors.white} />
      <Text style={glassStyle.bodyText}>
        {birthDate
          ? new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(birthDate)
          : "Tap to choose date"}
      </Text>
    </TouchableOpacity>

{showDatePicker && (
  <Modal transparent animationType="fade">
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" }}>
      <View style={{ backgroundColor: colors.background }}>
        {/* Done Button */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 8 }}>
          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
            <Text style={{ color: colors.gold, fontWeight: "bold", fontSize: 16 }}>Done</Text>
          </TouchableOpacity>
        </View>

        <DateTimePicker
          value={birthDate || new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) setBirthDate(selectedDate);
            // Don't close picker on scroll, only on Done
          }}
          style={{ backgroundColor: colors.background }}
        />
      </View>
    </View>
  </Modal>
)}


  </View>
)}


        {step === 2 && (
          <View style={[styles.inputBlock, glassStyle.card]}>
            <Text style={glassStyle.badgeText}>Enter your Birth Time</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              {/* Hour Input */}
              <View style={[glassStyle.input, { width: 80, marginRight: 2 }]}>
                <TextInput
                  placeholder="HH"
                  placeholderTextColor={colors.accent}
                  style={{ color: colors.white, textAlign: "center" }}
                  keyboardType="numeric"
                  maxLength={2}
                  value={hourInput}
                  onChangeText={setHourInput}
                />
              </View>

              <Text style={[glassStyle.bodyText, { marginHorizontal: 4 }]}>
                :
              </Text>

              {/* Minute Input */}
              <View style={[glassStyle.input, { width: 80, marginRight: 2 }]}>
                <TextInput
                  placeholder="MM"
                  placeholderTextColor={colors.accent}
                  style={{ color: colors.white, textAlign: "center" }}
                  keyboardType="numeric"
                  maxLength={2}
                  value={minuteInput}
                  onChangeText={setMinuteInput}
                />
              </View>

              {/* Second Input */}
              <View style={[glassStyle.input, { width: 80, marginRight: 2 }]}>
                <TextInput
                  placeholder="SS"
                  placeholderTextColor={colors.accent}
                  style={{ color: colors.white, textAlign: "center" }}
                  keyboardType="numeric"
                  maxLength={2}
                  value={secondInput}
                  onChangeText={setSecondInput}
                />
              </View>

              
            </View>
            {/* AM/PM Toggle  */}
              <View style={[glassStyle.input, { width: 100 }]}>
               {/* <Text style={{color: colors.white, textAlign: "center",marginVertical: 6, }}>{ampm}</Text> */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <TouchableOpacity onPress={() => setAmpm("AM")}>
                    <Text style={[glassStyle.badgeText, { fontSize: 10 }]}>
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAmpm("PM")}>
                    <Text style={[glassStyle.badgeText, { fontSize: 10 }]}>
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>
        )}

        {step === 3 && (
          <View style={[styles.inputBlock, glassStyle.card]}>
            <Text style={glassStyle.badgeText}>Enter your Birth Place</Text>
            <View style={[glassStyle.input, { width: "100%", marginTop: 12 }]}>
              <TextInput
                placeholder="City / Town"
                placeholderTextColor={colors.accent}
                style={{ color: colors.white }}
                value={birthPlace}
                onChangeText={setBirthPlace}
              />
            </View>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[glassStyle.button, { marginTop: 20 }]}
          onPress={async () => {
            Keyboard.dismiss();
            await saveStepData();
            if (step < 4) {
              setStep(step + 1);
            } else {
              router.push("./StarRevealScreen");
            }
          }}
        >
          <Text style={glassStyle.buttonText}>
            {step < 4 ? "Next" : "Reveal My Stars"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  </TouchableWithoutFeedback>
  );
}
export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },

  inputBlock: { width: "100%", marginBottom: 18, alignItems: "center" },

  // CTA buttons align with neumorphic buttons
  ctaButton: {
    marginTop: 30,
    borderRadius: 40,
    width: 260,
    backgroundColor: colors.surface,
    // raised neumorphic style
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButton: { marginTop: 20, alignSelf: "center" },

  // Progress Bar
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.surface,
    width: "100%",
    marginTop: 40,
    borderRadius: 3,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.gold,
    borderRadius: 3,
  },

  // Guide row
  guideRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  portraitWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  glowRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderWidth: 0,
  },
  portrait: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  speechWrap: { flex: 1, paddingLeft: 8 },
  speechCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    minHeight: 72,
    justifyContent: "center",
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  headline: { marginTop: 8, marginBottom: 4, textAlign: "center", color: colors.white },
  inputButton: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
  },

  rim: {
    position: "absolute",
    top: -40,
    left: -60,
    right: -60,
    height: 400,
    borderRadius: 220,
    backgroundColor: "rgba(120,20,200,0.06)",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  orb: {
    position: "absolute",
    top: 40,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,240,200,0.08)",
    borderWidth: 0,
  },
  
});
