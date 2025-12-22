// app/(tabs)/Chat.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ALL_GUIDES, Guide as GuideType } from "../../data/guides";
import { colors, spacing } from "../../theme";

const getGeminiKey = () => process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash";

const USER_AVATAR = require("../../assets/images/user.png");
const DEFAULT_GUIDE_IMG = require("../../assets/images/guides/guide1-lady-Asian.jpg");

type Message = {
  id: string;
  from: "user" | "guide";
  text: string;
  timestamp?: string;
};

type AstrologyType = 'PrashnaKundali' | 'JanamKundali' | 'LifePath' | 'Horoscope' | 'Other';

type PendingInfo = {
  dob?: string;
  time?: string;
  place?: string;
  partnerName?: string;
  partnerDob?: string;
  partnerPlace?: string;
};

interface Notes {
  name?: string;
  dob?: string;
  time?: string;
  place?: string;
  lastTopic?: string;
}

// 🔹 Intent detection
function detectIntent(userMsg: string): "compatibility" | "prashna" | "casual" {
  const msg = userMsg.toLowerCase();
  if (
    msg.includes("compatibility") ||
    msg.includes("match") ||
    msg.includes("partner") ||
    msg.includes("relationship") ||
    msg.includes("love")
  ) {
    return "compatibility";
  }
  if (
    msg.includes("now") ||
    msg.includes("should") ||
    msg.includes("will") ||
    msg.includes("when") ||
    msg.includes("today")
  ) {
    return "prashna";
  }
  return "casual";
}

// 🔹 Prompt builder
function buildReadingPrompt(
  userMsg: string,
  type: AstrologyType,
  info: PendingInfo,
  notes: Notes = {},
  summary: string = "",
  intent: "compatibility" | "prashna" | "casual" = "casual"
) {
  const userDetails = `Name: ${notes.name || "?"}, DOB: ${notes.dob || "?"}, Time: ${notes.time || "?"}, Place: ${notes.place || "?"}`;
  const partnerDetails =
    intent === "compatibility"
      ? `Partner Name: ${info.partnerName || "?"}, DOB: ${info.partnerDob || "?"}, Place: ${info.partnerPlace || "?"}`
      : "";

  if (intent === "compatibility") {
    return `
You are an expert astrologer. The user wants a COMPATIBILITY analysis.

Known details:
- User: ${userDetails}
- ${partnerDetails}

Explain their compatibility in a warm, mentor-like style. Highlight strengths, challenges, and advice. Use names/DOBs in the response naturally.
User Question: "${userMsg}"
    `;
  }

  if (intent === "prashna") {
    return `
You are an expert astrologer. The user is asking a Prashna Kundali style question.

Known info:
- ${userDetails}

User Question: "${userMsg}"

Respond using ${type}, in a mentor-like, concise, contextual style. Always reference the user's details in your reply naturally.
    `;
  }

  return `
You are a warm, mentor-like guide.

Remember details: ${userDetails}.
${summary ? "Conversation summary: " + summary : ""}
User Message: "${userMsg}"

Reply naturally, short, mentor-like, and contextual. Reference the user's name/DOB/time/place where relevant.
  `;
}


export default function ChatScreen() {

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>(messages);
  const [guide, setGuide] = useState<GuideType | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false); // keep for API calls if needed
  const [isTyping, setIsTyping] = useState(false); // NEW: typing indicator
  const [inputFocused, setInputFocused] = useState(false);
  const [pendingInfo, setPendingInfo] = useState<PendingInfo>({});
  const [waitingForUserInputKey, setWaitingForUserInputKey] = useState<keyof PendingInfo | null>(null);
  const handleInputSuggestion = (value: string) => {
  setText(value);

  if (waitingForUserInputKey) {
    const key = waitingForUserInputKey; // store first

    setPendingInfo((prev) => ({ ...prev, [key]: value }));
    setSystemNotes((prev) => ({ ...prev, [key]: value }));

    setWaitingForUserInputKey(null);
  }

  handleSend(value); // auto-send after tap
};

  const flatListRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);
  const animTranslateY = useRef(new Animated.Value(0)).current;
  const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
  const blurAnim = useRef(new Animated.Value(0)).current;


  interface Memory {
    user: {
      name?: string;
      dob?: string;
      time?: string;
      place?: string;
    };
    partner: {
      name?: string;
      dob?: string;
      place?: string;
    };
    marriageDate?: string;
  }

  const [systemNotes, setSystemNotes] = useState<Notes>({
    name: "",
    dob: "",
    time: "",
    place: "",
    lastTopic: "",
  });
  const [conversationSummary, setConversationSummary] = useState("");

  function detectTone(msg: string): "empathetic" | "playful" | "formal" | "mentor-like" {
  const m = msg.toLowerCase();
  if (m.includes("sad") || m.includes("worried")) return "empathetic";
  if (m.includes("joke") || m.includes("fun")) return "playful";
  return "mentor-like";
}



  useEffect(() => {
    Animated.timing(blurAnim, {
      toValue: inputFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [inputFocused]);

  // Keep ref in sync
useEffect(() => {
  messagesRef.current = messages;
}, [messages]);

  const [inputHeight, setInputHeight] = useState(48);
  const MIN_INPUT_HEIGHT = 46;
  const MAX_INPUT_HEIGHT = 140;

  const timestampNow = () => new Date().toLocaleTimeString();

  // Load guide, intro messages, and stored predictions
  useEffect(() => {
    const loadChatIntro = async () => {
      const savedId = await AsyncStorage.getItem("selectedGuideId");
      const guideObj = savedId ? ALL_GUIDES.find((g) => g.id === savedId) ?? null : null;
      setGuide(
        guideObj ?? {
          id: "default",
          name: "Your Guide",
          image: DEFAULT_GUIDE_IMG,
          role: "",
        }
      );


      const [name, dob, time, place, storedPredsRaw] = await Promise.all([
        AsyncStorage.getItem("userName"),
        AsyncStorage.getItem("birthDate"),
        AsyncStorage.getItem("birthTime"),
        AsyncStorage.getItem("birthPlace"),
        AsyncStorage.getItem("userPredictions"),
      ]);

      let predictions: string[] = [];
      if (storedPredsRaw) {
        try {
          const parsed = JSON.parse(storedPredsRaw);
          predictions = Array.isArray(parsed) ? parsed : [];
        } catch {
          predictions = [];
        }
      }

      const introMsgs: Message[] = [];
      introMsgs.push({
        id: "welcome",
        from: "guide",
        text: `✨ Hello ${name || "Traveler"}, I’m ${guideObj?.name || "Your Guide"}.`,
        timestamp: timestampNow(),
      });

      if (dob || time || place) {
        introMsgs.push({
          id: "birthDetails",
          from: "guide",
          text: `📜 I see your birth details:\nDOB: ${dob || "?"}\nTime: ${time || "?"}\nPlace: ${place || "?"}`,
          timestamp: timestampNow(),
        });
        setPendingInfo({ dob: dob ?? undefined, time: time ?? undefined, place: place ?? undefined });
      }

      predictions.forEach((pred, idx) => {
        introMsgs.push({
          id: `prediction_${idx}`,
          from: "guide",
          text: idx === 1 ? `🔮 Prediction: ${pred}` : `🌌 Prashna Kundali ${idx + 1}: ${pred}`,
          timestamp: timestampNow(),
        });
      });

      introMsgs.push({
        id: "prompt",
        from: "guide",
        text: "What would you like to explore further today? 🌠",
        timestamp: timestampNow(),
      });

      setMessages(introMsgs);

      setSystemNotes((prev) => ({
        ...prev,
        name: name || "",
        dob: dob || "",
        time: time || "",
        place: place || "",
      }));
    };

    loadChatIntro();
  }, []);
  
          // 🔹 Auto-scroll when new messages arrive
useEffect(() => {
  if (messages.length > 0) {
    flatListRef.current?.scrollToEnd({ animated: true });
  }
}, [messages]);

  // API call
async function callGemini(promptText: string): Promise<string> {
  const GEMINI_API_KEY = getGeminiKey();

  if (!GEMINI_API_KEY) {
    return "⚠️ Gemini key missing. Add EXPO_PUBLIC_GEMINI_API_KEY in .env and restart Expo (npx expo start -c).";
  }

  setLoading(true);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // ✅ Correct request body
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    );

    const json = await res.json();

    // ✅ Helpful error print (optional but recommended)
    if (!res.ok) {
      console.log("Gemini error response:", json);
      return json?.error?.message || "Gemini error. Please try again.";
    }

    return (
      json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "The stars are guiding you..."
    );
  } catch (e) {
    console.log("Gemini call failed:", e);
    return "A small cosmic interference — try again.";
  } finally {
    setLoading(false);
  }
}


  function buildClassificationPrompt(userMsg: string) {
    return `Classify this question into one of the following astrology types: PrashnaKundali, JanamKundali, LifePath, Horoscope, Other.\nQuestion: "${userMsg}"\nReturn only the type.`;
  }

const handleSend = async (overrideText?: string) => {
  const trimmed = (overrideText ?? text).trim();
  if (!trimmed) return;
  Keyboard.dismiss();
  setInputFocused(false);

  const userMsg: Message = {
    id: String(Date.now()),
    from: "user",
    text: trimmed,
    timestamp: timestampNow(),
  };
  setMessages((prev) => [...prev, userMsg]);
  setText("");
  setInputHeight(MIN_INPUT_HEIGHT);

  // Handle waiting for missing info
if (waitingForUserInputKey) {
  const key = waitingForUserInputKey;

  setPendingInfo((prev) => ({ ...prev, [key]: trimmed }));
  setSystemNotes((prev) => ({ ...prev, [key]: trimmed })); // ✅ important

  setWaitingForUserInputKey(null);

  setMessages((prev) => [
    ...prev,
    { id: String(Date.now()), from: "guide", text: "Got it! 🌟", timestamp: timestampNow() },
  ]);
  return;
}

  const intent = detectIntent(trimmed);

  // Name inquiry
  if (/your name|my name|who am i|do you know me/i.test(trimmed)) {
    const reply = systemNotes.name
      ? `Yes, I know your name — it's ${systemNotes.name}. 🌟 I will use it in readings.`
      : "I don’t know your name yet. Could you tell me?";
    setMessages((prev) => [...prev, { id: String(Date.now()), from: "guide", text: reply, timestamp: timestampNow() }]);
    return;
  }

  // Compatibility
  if (intent === "compatibility") {
    if (!pendingInfo.partnerName || !pendingInfo.partnerDob || !pendingInfo.partnerPlace) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          from: "guide",
          text: "To check compatibility, I’ll need your partner’s name, DOB, and birth place. 🌙",
          timestamp: timestampNow(),
        },
      ]);
      return;
    }
    const reply = await callGemini(buildReadingPrompt(trimmed, "Other", pendingInfo, systemNotes, conversationSummary, intent));
    setMessages((prev) => [...prev, { id: String(Date.now()), from: "guide", text: reply, timestamp: timestampNow() }]);
    setConversationSummary((prev) => prev + `\nUser: ${trimmed}\nGuide: ${reply}`);

    return;
  }

  // Classify astrology type
  const typeText = await callGemini(buildClassificationPrompt(trimmed));
  let astrologyType: AstrologyType = 'Other';
  if (typeText.includes('Prashna')) astrologyType = 'PrashnaKundali';
  else if (typeText.includes('Janam')) astrologyType = 'JanamKundali';
  else if (typeText.includes('Life')) astrologyType = 'LifePath';
  else if (typeText.includes('Horoscope')) astrologyType = 'Horoscope';

  // Ensure mandatory info
  if (astrologyType === "PrashnaKundali" || intent === "prashna") {
    if (!pendingInfo.dob) {
      setWaitingForUserInputKey("dob");
      setMessages((prev) => [...prev, { id: String(Date.now()), from: "guide", text: "Please provide your Date of Birth (YYYY-MM-DD).", timestamp: timestampNow() }]);
      return;
    }
    if (!pendingInfo.time) {
      setWaitingForUserInputKey("time");
      setMessages((prev) => [...prev, { id: String(Date.now()), from: "guide", text: "Please provide your Birth Time (HH:MM).", timestamp: timestampNow() }]);
      return;
    }
    if (!pendingInfo.place) {
      setWaitingForUserInputKey("place");
      setMessages((prev) => [...prev, { id: String(Date.now()), from: "guide", text: "Please provide your Birth Place (City, Country).", timestamp: timestampNow() }]);
      return;
    }
  }
// Show guide typing for 0.5-1.5 seconds

setIsTyping(true);
await new Promise(res => setTimeout(res, 500 + Math.random() * 1000));

const tone = detectTone(trimmed); // NEW: detect tone
const reading = await callGemini(
  buildReadingPrompt(trimmed, astrologyType, pendingInfo, systemNotes, conversationSummary, intent)
  + `\nRespond in a ${tone} tone.`
);

// 🔹 Add guide message with animation
const fullText = `${systemNotes.name ? systemNotes.name + ", " : ""}${reading}`;
const guideMessageId = `guide_${Date.now()}`; // unique ID

// Add empty guide message first
setMessages(prev => [
  ...prev,
  { id: guideMessageId, from: "guide", text: "", timestamp: timestampNow() }
]);

// Update conversation summary
setConversationSummary(prev => {
  const updated = prev + `\nUser: ${trimmed}\nGuide: ${reading}`;
  const lines = updated.split("\n");
  return lines.slice(-40).join("\n");
});

// Animate text character by character
setIsTyping(true);
let i = 0;

const interval = setInterval(() => {
  i++;

  const newMessages = [...messagesRef.current];
  const idx = newMessages.findIndex(msg => msg.id === guideMessageId);
  if (idx !== -1) {
    newMessages[idx] = { ...newMessages[idx], text: fullText.slice(0, i) };
    setMessages(newMessages);
    messagesRef.current = newMessages; // update ref
  }

  // Scroll to bottom smoothly
  flatListRef.current?.scrollToEnd({ animated: true });

  if (i >= fullText.length) {
    clearInterval(interval);
    setIsTyping(false); // hide typing indicator
  }
}, 25);


};

const Bubble = ({ item, guide }: { item: Message; guide: GuideType | null }) => {
  const isGuide = item.from === "guide";
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const gradient: [string, string] = isGuide
    ? ["#FFFFFF", "#e1c3faff"]
    : ["#d1a2f7ff", "#FFFFFF"];

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={[styles.bubbleRow, isGuide ? styles.left : styles.right]}>
        <Image
          source={isGuide ? guide?.image ?? DEFAULT_GUIDE_IMG : USER_AVATAR}
          style={styles.avatar}
        />
        <LinearGradient
          colors={gradient}
          style={[
            styles.bubble,
            isGuide ? styles.guideBubble : styles.userBubble,
          ]}
        >
          <Text style={styles.bubbleText}>{item.text}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};


return (
  <SafeAreaView style={styles.container}>
    <AnimatedBlurView
  intensity={blurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20], // much lower
  })}
  tint="dark"
  style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // only input area
  }}
/>


    {guide && (
      <View style={styles.header}>
        <Image source={guide.image ?? DEFAULT_GUIDE_IMG} style={styles.headerAvatar} />
        <View>
          <Text style={styles.headerName}>{guide.name}</Text>
          {guide.role ? <Text style={styles.headerRole}>{guide.role}</Text> : null}
        </View>
      </View>
    )}

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? tabBarHeight + insets.bottom : 0}

    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <FlatList
  ref={flatListRef}
  data={messages}
  renderItem={({ item }) => <Bubble item={item} guide={guide} />}
  keyExtractor={(item) => item.id}
  style={styles.messageList}
  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
  onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
/>

      </TouchableWithoutFeedback>

      {/* 🔹 Inline suggestion buttons */}
      {waitingForUserInputKey &&
        ["dob", "time", "place"].includes(waitingForUserInputKey) && (
          <View
            style={{
              flexDirection: "row",
              marginTop: 6,
              paddingHorizontal: spacing.md,
            }}
          >
            {waitingForUserInputKey === "dob" &&
              ["2000-01-01", "1995-05-05"].map((date) => (
                <TouchableOpacity
                  key={date}
                  onPress={() => handleInputSuggestion(date)}
                  style={{
                    padding: 6,
                    backgroundColor: "#58049c",
                    borderRadius: 8,
                    marginRight: 6,
                  }}
                >
                  <Text style={{ color: "white" }}>{date}</Text>
                </TouchableOpacity>
              ))}
            {waitingForUserInputKey === "time" &&
              ["12:00", "06:30"].map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => handleInputSuggestion(time)}
                  style={{
                    padding: 6,
                    backgroundColor: "#58049c",
                    borderRadius: 8,
                    marginRight: 6,
                  }}
                >
                  <Text style={{ color: "white" }}>{time}</Text>
                </TouchableOpacity>
              ))}
            {waitingForUserInputKey === "place" &&
              ["Varanasi, India", "Delhi, India"].map((place) => (
                <TouchableOpacity
                  key={place}
                  onPress={() => handleInputSuggestion(place)}
                  style={{
                    padding: 6,
                    backgroundColor: "#58049c",
                    borderRadius: 8,
                    marginRight: 6,
                  }}
                >
                  <Text style={{ color: "white" }}>{place}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

      {/* 🔹 Typing indicator */}
{isTyping && (
  <View style={{ flexDirection: "row", padding: 8 }}>
    <ActivityIndicator size="small" color="#fff" />
    <Text style={{ marginLeft: 8, color: "#fff", fontWeight: "500" }}>Guide is typing...</Text>
  </View>
)}


      {/* 🔹 Input box */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { height: inputHeight, marginBottom: tabBarHeight }]}
          value={text}
          onChangeText={setText}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          multiline
  onContentSizeChange={(e) =>
    setInputHeight(
      Math.min(Math.max(e.nativeEvent.contentSize.height, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT)
    )}
        />
        <TouchableOpacity onPress={() => handleSend()} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);


}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGradient[0],
  },

  flex: { flex: 1 },

  // Header with soft surface
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  headerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
  },

  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  headerAvatarHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  headerName: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  headerRole: {
    color: colors.accent,
    fontSize: 12,
  },

  // Chat bubbles
  bubbleRow: {
    flexDirection: "row",
    marginVertical: spacing.xs,
    alignItems: "flex-end",
  },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end" },

  bubble: {
    maxWidth: "78%",
    padding: spacing.md,
    borderRadius: 22,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
  },

  userBubble: {
    borderBottomRightRadius: 6,
    alignSelf: "flex-end",
    backgroundColor: colors.surface,
  },
  guideBubble: {
    borderBottomLeftRadius: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
  },

  bubbleText: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
  },

  timestamp: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    textAlign: "right",
  },

  // Typing indicator
  typingWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },

  // Input row with neumorphism
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  inputRowHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
  },

  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 17,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
    messageList: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  inputContainer: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: "rgba(255,255,255,0.1)",
},
sendButton: {
  marginLeft: 8,
  paddingVertical: 8,
  paddingHorizontal: 14,
  backgroundColor: "#58049c",
  borderRadius: 20,
},
sendButtonText: {
  color: "white",
  fontWeight: "600",
},
input: {
  flex: 1,
  color: colors.white,
  fontSize: 15,
  paddingVertical: 8,
  paddingHorizontal: 12,
},

});
