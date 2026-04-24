import { Slot, useRouter, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext, AuthProvider } from "../context/AuthContext";

function RootLayoutNav() {
  const { session, loading } = useContext(AuthContext)!;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, loading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}