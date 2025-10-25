import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, Button, FAB, Snackbar, Chip } from "react-native-paper";
import { useEffect, useState } from "react";
import {
  loadModules,
  loadMarkdown,
  loadPathways,
} from "../../src/services/markdownLoader";
import { StorageService } from "../../src/services/storageService";
import { analyticsService } from "../../src/services/analyticsService";
import MarkdownView from "../../src/components/MarkdownView";
import EnhancedAudioPlayer from "../../src/components/AudioPlayer";
import { ModuleInterface } from "@/model/ModuleInterface";

export default function ModuleViewer() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [module, setModule] = useState<ModuleInterface>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [notesCount, setNotesCount] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [pathwayId, setPathwayId] = useState<string>();

  useEffect(() => {
    loadModuleData();
  }, [id]);

  const loadModuleData = async () => {
    try {
      const modules = await loadModules();
      const m = modules.find((x: any) => x.moduleId === id);
      if (m) {
        setModule(m);
        const text = await loadMarkdown(m.markdownPath);
        setContent(text);

        // Check if favorite
        const favoriteStatus = await StorageService.isFavorite(m.moduleId);
        setIsFavorite(favoriteStatus);

        // Load notes count
        const notes = await StorageService.getNotesByModule(m.moduleId);
        setNotesCount(notes.length);

        // Find pathway context
        const pathways = await loadPathways();
        const pathway = pathways.find((p) => p.moduleIds.includes(m.moduleId));
        setPathwayId(pathway?.pathwayId);

        // Track module view
        await analyticsService.trackModuleView(m.moduleId, pathway?.pathwayId);
      }
    } catch (error) {
      console.error("Error loading module:", error);
      showSnackbar("Gagal memuat modul");
    }
  };

  const toggleFavorite = async () => {
    if (!module) return;

    try {
      await StorageService.toggleFavorite(module.moduleId);
      const newFavoriteStatus = await StorageService.isFavorite(
        module.moduleId
      );
      setIsFavorite(newFavoriteStatus);

      // Track favorite event
      await analyticsService.trackFavoriteToggle(
        module.moduleId,
        newFavoriteStatus
      );

      showSnackbar(
        newFavoriteStatus ? "Ditambahkan ke favorit" : "Dihapus dari favorit"
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showSnackbar("Gagal memperbarui favorit");
    }
  };

  const navigateToNotes = () => {
    if (!module) return;
    router.push(`/notes/module/${module.moduleId}`);
  };

  const navigateToAddNote = (type: "text" | "audio") => {
    if (!module) return;
    const route =
      type === "text"
        ? `/notes/add/${module.moduleId}`
        : `/notes/record/${module.moduleId}`;
    router.push(route);
  };

  const markAsComplete = async () => {
    if (!module || !pathwayId) return;

    try {
      const modules = await loadModules();
      await StorageService.updateModuleProgress(
        pathwayId,
        module.moduleId,
        modules
      );

      // Track completion
      await analyticsService.trackModuleComplete(module.moduleId, pathwayId);

      showSnackbar("Modul ditandai sebagai selesai!");
    } catch (error) {
      console.error("Error marking module as complete:", error);
      showSnackbar("Gagal menandai modul sebagai selesai");
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  if (!module) {
    return (
      <View style={styles.centered}>
        <Text>Memuat modul...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text variant="headlineSmall" style={styles.title}>
          {module.title}
        </Text>

        <View style={styles.metaInfo}>
          <Chip
            icon={isFavorite ? "heart" : "heart-outline"}
            selected={isFavorite}
            onPress={toggleFavorite}
            style={styles.chip}
          >
            {isFavorite ? "Favorit" : "Favorit"}
          </Chip>

          <Chip icon="note" onPress={navigateToNotes} style={styles.chip}>
            Catatan ({notesCount})
          </Chip>

          {pathwayId && (
            <Chip
              icon="check-circle"
              onPress={markAsComplete}
              style={styles.chip}
              mode="outlined"
            >
              Selesai
            </Chip>
          )}
        </View>

        <MarkdownView content={content} />

        <View style={styles.audioSection}>
          <EnhancedAudioPlayer module={module} />
        </View>

        {/* Quick Note Actions */}
        <View style={styles.quickNoteSection}>
          <Text variant="titleMedium" style={styles.quickNoteTitle}>
            Tambah Catatan Cepat
          </Text>
          <View style={styles.quickNoteButtons}>
            <Button
              mode="outlined"
              icon="text"
              onPress={() => navigateToAddNote("text")}
              style={styles.quickNoteButton}
            >
              Teks
            </Button>
            <Button
              mode="outlined"
              icon="microphone"
              onPress={() => navigateToAddNote("audio")}
              style={styles.quickNoteButton}
            >
              Audio
            </Button>
          </View>
        </View>
      </ScrollView>

      <FAB
        icon="note-plus"
        style={styles.fab}
        onPress={() => navigateToAddNote("text")}
        label="Catatan Baru"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 16,
    fontWeight: "bold",
  },
  metaInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    marginBottom: 8,
  },
  audioSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  quickNoteSection: {
    marginBottom: 100,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  quickNoteTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  quickNoteButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickNoteButton: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
