// app/(tabs)/Profile.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelectedGuide } from "../../hooks/useSelectedGuide";
import { colors, glassStyle } from "../../theme";

/** Local helper: pull user profile persisted at "userProfile" */
type UserProfile = {
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  dob?: string;         // YYYY-MM-DD
  city?: string;
  gender?: string;
  profession?: string;
  coins?: number;
  xp?: number;
  streak?: number;
  preferences?: string[];
};

function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("userProfile");
        if (raw) setProfile(JSON.parse(raw));
      } catch (e) {
        console.log("Failed to load userProfile:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { profile, loading };
}

function getZodiac(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d as any)) return "";
  const m = d.getMonth() + 1;
  const day = d.getDate();
  // Western zodiac cutoffs
  const Z = [
    ["Capricorn", 1, 19], ["Aquarius", 2, 18], ["Pisces", 3, 20], ["Aries", 4, 19],
    ["Taurus", 5, 20], ["Gemini", 6, 20], ["Cancer", 7, 22], ["Leo", 8, 22],
    ["Virgo", 9, 22], ["Libra", 10, 22], ["Scorpio", 11, 21], ["Sagittarius", 12, 21],
  ] as const;
  const idx = m - 1;
  const [sign, , cutoff] = Z[idx];
  const prev = Z[(idx + 11) % 12][0];
  return day <= cutoff ? sign : Z[(idx + 1) % 12][0] || prev;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { guide } = useSelectedGuide();
  const { profile } = useUserProfile();

  const name = profile?.name || "Vinay Singh";
  const userAvatar = profile?.avatar || "https://i.pravatar.cc/150?img=1";
  const coins = profile?.coins ?? 240;
  const xp = profile?.xp ?? 420;
  const streak = profile?.streak ?? 7;
  const zodiac = useMemo(() => getZodiac(profile?.dob), [profile?.dob]);

  const preferences = profile?.preferences ?? ["Focus", "Calm", "Growth"];

  const go = (path: string) => router.push(path as any);

  const clearLocal = async () => {
    Alert.alert(
      "Clear Local Data",
      "This will clear your saved guide and local profile. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["selectedGuide", "userProfile"]);
              Alert.alert("Done", "Local data cleared.");
            } catch (e) {
              Alert.alert("Error", "Failed to clear data.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Top identity card */}
        <View style={[glassStyle.shadowCard, styles.topCard]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.subtitle}>
                {profile?.profession || "Seeker"} {zodiac ? `• ${zodiac}` : ""}
              </Text>
              <Text style={[styles.subtitle, { opacity: 0.8 }]}>
                Guide: {guide?.name ?? "Not selected"} {guide?.role ? `(${guide.role})` : ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => go("/settings")} style={[glassStyle.shadowButton]}>
            <Text style={glassStyle.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Quick stats */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.statsRow}>
            <View style={[glassStyle.shadowCard, styles.statCard]}>
              <Ionicons name="flame" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{streak}d</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={[glassStyle.shadowCard, styles.statCard]}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={[glassStyle.shadowCard, styles.statCard]}>
              <Ionicons name="wallet" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{coins}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </View>
        </View>

        {/* Guide connection (user & guide side-by-side) */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Your Connection</Text>
          <View style={[glassStyle.shadowCard, styles.connectionCard]}>
            <View style={styles.duo}>
              <View style={styles.duoItem}>
                <Image source={{ uri: userAvatar }} style={styles.duoAvatar} />
                <Text style={styles.duoName} numberOfLines={1}>{name}</Text>
                <Text style={styles.duoRole} numberOfLines={1}>{profile?.profession || "Seeker"}</Text>
              </View>
              <Ionicons name="swap-horizontal" size={18} color={colors.accent} style={{ opacity: 0.8 }} />
              <View style={styles.duoItem}>
                {/*<Image source={{ uri: guide?.image ?? "https://i.pravatar.cc/150?img=14" }} style={styles.duoAvatar} />*/}
                <Text style={styles.duoName} numberOfLines={1}>{guide?.name ?? "Select a guide"}</Text>
                <Text style={styles.duoRole} numberOfLines={1}>{guide?.role ?? ""}</Text>
              </View>
            </View>

            <View style={styles.connectionActions}>
              <Pressable onPress={() => go("/Chat")} style={[glassStyle.shadowButton, styles.actionBtn]}>
                <Ionicons name="chatbubble-ellipses" size={16} color={colors.black} />
                <Text style={[glassStyle.buttonText, { marginLeft: 6 }]}>Message</Text>
              </Pressable>
              <Pressable onPress={() => go("/GuideSelectScreen")} style={[glassStyle.shadowButton, styles.actionBtn]}>
                <Ionicons name="people" size={16} color={colors.black} />
                <Text style={[glassStyle.buttonText, { marginLeft: 6 }]}>Switch Guide</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* User details */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Your Details</Text>

          <View style={[glassStyle.shadowCard, styles.infoCard]}>
            <Row label="Full Name" value={name} icon="person" />
            <Row label="Email" value={profile?.email || "—"} icon="mail" />
            <Row label="Phone" value={profile?.phone || "—"} icon="call" />
            <Row label="Date of Birth" value={profile?.dob || "—"} icon="calendar" />
            <Row label="City" value={profile?.city || "—"} icon="location" />
            <Row label="Gender" value={profile?.gender || "—"} icon="male-female" />
            <Row label="Profession" value={profile?.profession || "—"} icon="briefcase" />
          </View>
        </View>

        {/* Preferences */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Your Focus Areas</Text>
          <View style={[glassStyle.shadowCard, styles.prefsCard]}>
            <View style={styles.chipsRow}>
              {preferences.map((p, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{p}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => go("/settings")} style={[glassStyle.shadowButton, { alignSelf: "flex-start", marginTop: 10 }]}>
              <Text style={glassStyle.buttonText}>Edit Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shortcuts */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Shortcuts</Text>
          <View style={styles.shortcutsRow}>
            <Shortcut icon="wallet" label="Wallet" onPress={() => go("/Wallet")} />
            <Shortcut icon="trophy" label="Achievements" onPress={() => go("/Achievements")} />
            <Shortcut icon="checkmark-circle" label="Rituals" onPress={() => go("/Rituals")} />
            <Shortcut icon="location-outline" label="Quests" onPress={() => go("/Quests")} />
            <Shortcut icon="settings" label="Settings" onPress={() => go("/settings")} />
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={[glassStyle.shadowCard, styles.infoCard]}>
            <TouchableOpacity onPress={() => Alert.alert("Coming soon", "Download data will be available in a future update.")} style={styles.rowBtn}>
              <Ionicons name="cloud-download" size={18} color={colors.accent} />
              <Text style={styles.rowBtnText}>Download My Data</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearLocal} style={styles.rowBtn}>
              <Ionicons name="trash" size={18} color={colors.accent} />
              <Text style={styles.rowBtnText}>Clear Local Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Small subcomponents ---------- */
function Row({ label, value, icon }: { label: string; value?: string; icon: any }) {
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={18} color={colors.accent} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoText} numberOfLines={1}>{value || "—"}</Text>
    </View>
  );
}

function Shortcut({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[glassStyle.shadowCard, styles.shortcut]}>
      <Ionicons name={icon} size={20} color={colors.accent} />
      <Text style={styles.shortcutText}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGradient[0] },

  topCard: { margin: 12, padding: 18, borderRadius: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  name: { color: colors.accent, fontSize: 18, fontWeight: "800" },
  subtitle: { color: colors.white, marginTop: 4 },

  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: "700", marginBottom: 10 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  statCard: { flex: 1, padding: 14, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  statValue: { color: colors.white, fontWeight: "900", fontSize: 16, marginTop: 6 },
  statLabel: { color: colors.light, fontSize: 12, marginTop: 2 },

  connectionCard: { padding: 16, borderRadius: 20 },
  duo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  duoItem: { alignItems: "center", width: "40%" },
  duoAvatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 6 },
  duoName: { color: colors.white, fontWeight: "800" },
  duoRole: { color: colors.light, fontSize: 12, marginTop: 2 },
  connectionActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end", marginTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },

  infoCard: { marginBottom: 12, padding: 8, borderRadius: 20 },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: { color: colors.accent, fontWeight: "700", marginLeft: 8 },
  infoText: { color: colors.white, maxWidth: "55%" },

  prefsCard: { padding: 14, borderRadius: 20 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipText: { color: colors.white, fontWeight: "700", fontSize: 12 },

  shortcutsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shortcut: { width: "30%", minWidth: 100, paddingVertical: 14, alignItems: "center", borderRadius: 18 },
  shortcutText: { color: colors.white, fontWeight: "700", marginTop: 6 },

  rowBtn: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowBtnText: { color: colors.white, fontWeight: "700" },
});
