import { ScrollView } from "react-native";
import { Text, Card } from "react-native-paper";

export default function NotesScreen() {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall">Catatan Saya</Text>
      <Card style={{ marginVertical: 12 }}>
        <Card.Title title="Belum ada catatan" />
      </Card>
    </ScrollView>
  );
}
