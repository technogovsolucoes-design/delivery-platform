import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: "#14171b" }, headerTintColor: "#e8eaed" }} />
      </CartProvider>
    </AuthProvider>
  );
}
