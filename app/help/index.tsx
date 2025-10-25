import { ScrollView } from "react-native";
import { Text } from "react-native-paper";

export default function HelpScreen() {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text
        variant="headlineSmall"
        style={{ color: "black", fontWeight: "bold" }}
      >
        Bantuan & Krisis
      </Text>
      <Text style={{ color: "black" }}>
        Aplikasi ini adalah alat bantu mandiri, bukan pengganti terapi
        profesional.
      </Text>
      <Text style={{ marginTop: 16, color: "black" }}>
        Jika kamu merasa tidak aman:
        {"\n"}• Hubungi layanan darurat lokal
        {"\n"}• Hubungi teman atau keluarga terpercaya
      </Text>
    </ScrollView>
  );
}
