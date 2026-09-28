import React from 'react';
import { Stack } from 'expo-router';

export default function ProjectsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="createProject" options={{ headerShown: false }} />
      <Stack.Screen name="[projectId]" options={{ headerShown: false }} />
    </Stack>
  );
}
