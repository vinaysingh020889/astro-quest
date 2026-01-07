import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>


      {/* Welcome / Entry */}
      <Stack.Screen name="index" />

      {/* Onboarding */}
      <Stack.Screen name="onboarding/GuideSelectScreen" />
      <Stack.Screen name="onboarding/BirthDetailsScreen" />
      <Stack.Screen name="onboarding/StarRevealScreen" />
      <Stack.Screen name="onboarding/PersonaScreen" />

      {/* Main App */}
      <Stack.Screen name="(tabs)" />
      

    </Stack>
  );
}

