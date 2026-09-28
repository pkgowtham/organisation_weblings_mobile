import React from 'react';
import { Stack } from 'expo-router';

export default function TeamsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[teamId]" options={{ headerShown: false }} />
      <Stack.Screen name="createTeam" options={{ headerShown: false }} />
      <Stack.Screen name="editTeam" options={{ headerShown: false }} />
      <Stack.Screen name="addTeamMembers" options={{ headerShown: false }} />
      <Stack.Screen name="addMembersToTeam" options={{ headerShown: false }} />
      <Stack.Screen name="removeMembers" options={{ headerShown: false }} />
    </Stack>
  );
}
