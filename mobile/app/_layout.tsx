import "@/global.css";
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/[id]" options={{ presentation: "card", headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}