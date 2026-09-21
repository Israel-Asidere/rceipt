import { Stack } from 'expo-router';
import { ReceiptsProvider } from './contexts/ReceiptsContext';

export default function RootLayout() {
  return (
    <ReceiptsProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
    </Stack>
    </ReceiptsProvider>
  );
}