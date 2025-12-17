// app/onboarding/_stack.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import BirthDetailsScreen from "./BirthDetailsScreen";
import GuideSelectScreen from "./GuideSelectScreen";
import PersonaScreen from "./PersonaScreen";
import StarRevealScreen from "./StarRevealScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="GuideSelect"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="GuideSelect" component={GuideSelectScreen} />
      <Stack.Screen name="BirthDetails" component={BirthDetailsScreen} />
      <Stack.Screen name="StarReveal" component={StarRevealScreen} />
      <Stack.Screen name="Persona" component={PersonaScreen} />
    </Stack.Navigator>
  );
}
