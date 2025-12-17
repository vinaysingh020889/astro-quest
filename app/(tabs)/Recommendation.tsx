// app/(tabs)/Recommendation.tsx
import React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, glassStyle } from "../../theme";

const recs = [
  { id: "1", title: "Moon Ritual", desc: "Full moon journaling for clarity" },
  { id: "2", title: "Career Booster", desc: "3-step morning routine" },
  { id: "3", title: "Love Insight", desc: "Communication prompts" },
  { id: "4", title: "Daily Quest", desc: "Micro tasks to level up" },
];

export default function RecommendationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Personalized Recommendations</Text>

      <FlatList
        data={recs}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[glassStyle.shadowCard, styles.card]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>

            <TouchableOpacity style={[glassStyle.shadowButton]}>
              <Text style={glassStyle.buttonText}>Try</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGradient[0],
  },
  header: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
    padding: 16,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  desc: {
    color: colors.white,
    opacity: 0.85,
    marginTop: 6,
    fontSize: 14,
  },
});
