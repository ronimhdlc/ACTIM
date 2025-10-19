import { ScrollView } from "react-native";
import { Text } from "react-native-paper";

export default function HelpScreen() {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall">Bantuan & Krisis</Text>
      <Text>
        Aplikasi ini adalah alat bantu mandiri, bukan pengganti terapi
        profesional.
      </Text>
      <Text style={{ marginTop: 16 }}>
        Jika kamu merasa tidak aman:
        {"\n"}• Hubungi layanan darurat lokal
        {"\n"}• Hubungi teman atau keluarga terpercaya
      </Text>
    </ScrollView>
  );
}
