import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { Button, Text } from "react-native-paper";
import AudioPlayer from "../../src/components/AudioPlayer";
import { loadMarkdown, loadModules } from "../../src/services/markdownLoader";
import {
  getFavorites,
  toggleFavorite,
} from "../../src/services/storageService";

export default function ModuleViewer() {
  const { id } = useLocalSearchParams();
  const [module, setModule] = useState<any>(null);
  const [content, setContent] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      const allModules = await loadModules();
      const m = allModules.find((x: any) => x.moduleId === id);
      setModule(m);

      const md = await loadMarkdown(m.markdownPath);
      setContent(md);

      const favs = await getFavorites();
      setIsFavorite(favs.includes(m.moduleId));
    })();
  }, [id]);

  if (!module) return null;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
        {module.title}
      </Text>
      <Markdown>{content}</Markdown>

      <View style={{ marginVertical: 16 }}>
        <AudioPlayer source={module.audioPath} />
      </View>

      <Button
        mode={isFavorite ? "contained-tonal" : "outlined"}
        icon="heart-outline"
        onPress={async () => {
          const state = await toggleFavorite(module.moduleId);
          setIsFavorite(state);
        }}
      >
        {isFavorite ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
      </Button>
    </ScrollView>
  );
}
