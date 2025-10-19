import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { loadPathways } from "../../src/services/markdownLoader";

export default function HomeScreen() {
  const router = useRouter();
  const [pathways, setPathways] = useState([]);

  useEffect(() => {
    loadPathways().then(setPathways);
  }, []);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Jalur Belajar (Pathways)
      </Text>
      {pathways.map((p) => (
        <Card
          key={p.pathwayId}
          style={{ marginBottom: 12 }}
          onPress={() => router.push(`/pathways/${p.pathwayId}`)}
        >
          <Card.Title title={p.name} subtitle={p.description} />
        </Card>
      ))}
      <Button
        icon="help-circle-outline"
        mode="outlined"
        onPress={() => router.push("/help")}
      >
        Bantuan & Krisis
      </Button>
    </ScrollView>
  );
}
