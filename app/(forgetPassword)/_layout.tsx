import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function ForgetPasswordLayout() {
  return (
    <Stack>
      <Stack.Screen name="forgetPassword" options={{ headerShown: false }} />
      <Stack.Screen name="forgetPasswordOtp" options={{ headerShown: false }} />
      <Stack.Screen name="enterNewPassword" options={{ headerShown: false }} />
      <Stack.Screen name="resetSuccessful" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({});
