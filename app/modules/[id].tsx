import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useEffect, useState } from "react";
import Markdown from "react-native-markdown-display";
import { loadModules, loadMarkdown } from "../../src/services/markdownLoader";
import AudioPlayer from "../../src/components/AudioPlayer";

export default function ModuleViewer() {
  const { id } = useLocalSearchParams();
  const [content, setContent] = useState("");
  const [module, setModule] = useState(null);

  useEffect(() => {
    (async () => {
      const modules = await loadModules();
      const m = modules.find((x) => x.moduleId === id);
      setModule(m);
      const text = await loadMarkdown(m.markdownPath);
      setContent(text);
    })();
  }, []);

  if (!module) return null;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
        {module.title}
      </Text>
      <Markdown>{content}</Markdown>
      <View style={{ marginVertical: 20 }}>
        <AudioPlayer source={module.audioPath} />
      </View>
      <Button mode="outlined" icon="note-outline">
        Tambah Catatan
      </Button>
    </ScrollView>
  );
}
