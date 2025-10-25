// /app/pathways/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { loadPathways, loadModules } from "../../src/services/markdownLoader";
import { ModuleInterface } from "@/model/ModuleInterface";

export default function PathwayDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [modules, setModules] = useState<ModuleInterface[]>([]);

  useEffect(() => {
    (async () => {
      const paths = await loadPathways();
      const p = paths.find((x: any) => x.pathwayId === id);
      const all = await loadModules();
      const mods = all.filter((m: any) => p.moduleIds.includes(m.moduleId));
      setModules(mods);
    })();
  }, [id]);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleMedium" style={{ marginBottom: 12 }}>
        Modul dalam Pathway Ini
      </Text>
      {modules.map((m) => (
        <Card
          key={m.moduleId}
          style={{ marginBottom: 12 }}
          onPress={() => router.push(`/modules/${m.moduleId}`)}
        >
          <Card.Title title={m.title} />
        </Card>
      ))}
    </ScrollView>
  );
}
