import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      <Stack.Screen name="verifyEmailOtp" options={{ headerShown: false }} />
      <Stack.Screen name="createAccount" options={{ headerShown: false }} />
      <Stack.Screen name="enableTwoFactor" options={{ headerShown: false }} />
      <Stack.Screen name="enterMobile" options={{ headerShown: false }} />
      <Stack.Screen name="verifyOtp" options={{ headerShown: false }} />
    </Stack>
  );
}
