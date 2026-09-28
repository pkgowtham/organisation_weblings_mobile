import React from "react";
import { Stack } from "expo-router";

export default function OrganisationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="orgSetup" options={{ headerShown: false }} />
    </Stack>
  );
}
