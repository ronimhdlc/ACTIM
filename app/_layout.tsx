import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="pathways/[id]"
          options={{ title: "Pathway Detail" }}
        />
        <Stack.Screen name="modules/[id]" options={{ title: "Modul" }} />
        <Stack.Screen name="help/index" options={{ title: "Bantuan" }} />
      </Stack>
    </PaperProvider>
  );
}
