import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { colors } from "../styles/global";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.surface,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
        <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ), }} />
      <Tabs.Screen name="scan-receipt" options={{ title: "Scan Receipt", tabBarIcon: ({ color, size }) => (
            <Ionicons name='camera-outline' size={size} color={color} />
          ), }} />
      <Tabs.Screen name="create-receipt" options={{ title: "Create Receipt", tabBarIcon: ({ color, size }) => (
            <Ionicons name='add-circle' size={size} color={color} />
          ), }} />
      <Tabs.Screen name="receipts-summary" options={{ title: "Receipt Summary", tabBarIcon: ({ color, size }) => (
            <Ionicons name='receipt' size={size} color={color} />
          ), }} />
    </Tabs>
  );
}