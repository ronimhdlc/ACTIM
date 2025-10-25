import { ScrollView } from "react-native";
import { Text, Card } from "react-native-paper";

export default function FavoritesScreen() {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text
        variant="headlineSmall"
        style={{ color: "black", fontWeight: "bold" }}
      >
        Favorit
      </Text>
      <Card style={{ marginVertical: 12 }}>
        <Card.Title title="Belum ada favorit" />
      </Card>
    </ScrollView>
  );
}
