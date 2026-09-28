import React from 'react';
import { Stack } from 'expo-router';

export default function ClientsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="addClient" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="[clientId]" options={{ headerShown: false }} />
    </Stack>
  );
}
