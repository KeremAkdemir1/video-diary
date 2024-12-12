import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { FFmpegKitConfig } from "ffmpeg-kit-react-native";

const queryClient = new QueryClient();
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1e90ff" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: false,
        }}
      />
    </QueryClientProvider>
  );
}
