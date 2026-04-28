import { Slot, router } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext, AuthProvider } from "../context/AuthContext";

function RootLayoutNav() {
  const context = useContext(AuthContext);

  useEffect(() => {
    if (!context?.loading){
      if (!context?.session) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [context?.session, context?.loading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}