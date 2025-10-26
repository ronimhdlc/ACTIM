import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { loadPathways, loadModules } from "../../src/services/markdownLoader";

export default function PathwayDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const pathways = await loadPathways();
      const pathway = pathways.find((x: any) => x.pathwayId === id);
      const allModules = await loadModules();
      const filtered = allModules.filter((m: any) =>
        pathway.moduleIds.includes(m.moduleId)
      );
      setModules(filtered);
    })();
  }, [id]);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
        Daftar Modul
      </Text>

      {modules.map((m) => (
        <Card
          key={m.moduleId}
          style={{ marginBottom: 12 }}
          onPress={() => router.push(`/modules/${m.moduleId}`)}
        >
          <Card.Title title={m.title} subtitle={m.subtitle ?? ""} />
        </Card>
      ))}
    </ScrollView>
  );
}
