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

        {/* Notes Routes */}
        <Stack.Screen
          name="notes/module/[moduleId]"
          options={{ title: "Catatan Modul" }}
        />
        <Stack.Screen
          name="notes/add/[moduleId]"
          options={{ title: "Tambah Catatan" }}
        />
        <Stack.Screen
          name="notes/record/[moduleId]"
          options={{ title: "Rekam Catatan" }}
        />
      </Stack>
    </PaperProvider>
  );
}
