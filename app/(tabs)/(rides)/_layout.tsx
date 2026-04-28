import { Stack } from "expo-router";

export default function RidesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tracker" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}