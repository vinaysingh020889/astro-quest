import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Onboarding screens */}
      
      <Stack.Screen name="onboarding/GuideSelectScreen" />
      <Stack.Screen name="onboarding/BirthDetailsScreen" />
      <Stack.Screen name="onboarding/StarRevealScreen" />
      <Stack.Screen name="onboarding/PersonaScreen" />

      {/* Home (Tabs) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
