import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { loadModules } from "../../../src/services/markdownLoader";
import { StorageService } from "../../../src/services/storageService";
import { ModuleInterface } from "@/model/ModuleInterface";

export default function AddNoteScreen() {
  const { moduleId } = useLocalSearchParams();
  const router = useRouter();
  const [module, setModule] = useState<ModuleInterface>();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    loadModuleData();
  }, [moduleId]);

  const loadModuleData = async () => {
    try {
      const modules = await loadModules();
      const m = modules.find((x: any) => x.moduleId === moduleId);
      setModule(m);
    } catch (error) {
      console.error("Error loading module:", error);
    }
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    setCharacterCount(text.length);
  };

  const saveNote = async () => {
    if (!content.trim()) {
      Alert.alert("Peringatan", "Catatan tidak boleh kosong");
      return;
    }

    if (content.length > 2000) {
      Alert.alert(
        "Peringatan",
        "Catatan terlalu panjang (maksimal 2000 karakter)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await StorageService.saveNote({
        moduleId: moduleId as string,
        type: "text",
        content: content.trim(),
      });

      Alert.alert("Berhasil", "Catatan berhasil disimpan", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving note:", error);
      Alert.alert("Error", "Gagal menyimpan catatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCancel = () => {
    if (content.trim()) {
      Alert.alert(
        "Batal Menyimpan",
        "Catatan yang sudah ditulis akan hilang. Yakin ingin batal?",
        [
          { text: "Lanjutkan Edit", style: "cancel" },
          {
            text: "Ya, Batal",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (!module) {
    return (
      <ScrollView style={styles.container}>
        <Text>Memuat...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.moduleTitle}>
            Tambah Catatan Teks
          </Text>
          <Text variant="bodyMedium" style={styles.moduleSubtitle}>
            Modul: {module.title}
          </Text>

          <TextInput
            mode="outlined"
            multiline
            numberOfLines={10}
            placeholder="Tulis catatan Anda di sini...
            
Contoh:
• Insight yang didapat
• Penerapan dalam kehidupan sehari-hari
• Refleksi pribadi
• Rencana tindak lanjut"
            value={content}
            onChangeText={handleContentChange}
            style={styles.textInput}
            outlineStyle={styles.textInputOutline}
            maxLength={2000}
          />

          <Text
            variant="bodySmall"
            style={[
              styles.characterCount,
              characterCount > 1800 && styles.characterCountWarning,
            ]}
          >
            {characterCount}/2000 karakter
          </Text>

          <Text variant="bodySmall" style={styles.tips}>
            💡 Tips: Fokus pada penerapan praktis dan refleksi pribadi
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.actionCard}>
        <Card.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={confirmCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            mode="contained"
            onPress={saveNote}
            loading={isSubmitting}
            disabled={isSubmitting || !content.trim()}
            icon="content-save"
          >
            Simpan
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  moduleTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  moduleSubtitle: {
    color: "#666",
    marginBottom: 20,
  },
  textInput: {
    minHeight: 200,
    textAlignVertical: "top",
  },
  textInputOutline: {
    borderRadius: 8,
  },
  characterCount: {
    textAlign: "right",
    marginTop: 8,
    color: "#666",
  },
  characterCountWarning: {
    color: "#e74c3c",
    fontWeight: "bold",
  },
  tips: {
    marginTop: 16,
    color: "#666",
    fontStyle: "italic",
  },
  actionCard: {
    marginBottom: 20,
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
});
