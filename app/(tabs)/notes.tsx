import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, Card, Button, IconButton, Chip } from "react-native-paper";
import { loadModules } from "../../src/services/markdownLoader";
import { StorageService } from "../../src/services/storageService";
import { NoteItem } from "@/model/ModuleInterface";

export default function NotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "text" | "audio">("all");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const modules = await loadModules();
      const allNotes = await StorageService.getNotesWithDetails(modules);
      setNotes(allNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(
    (note) => filter === "all" || note.type === filter
  );

  const deleteNote = async (noteId: string) => {
    try {
      await StorageService.deleteNote(noteId);
      await loadNotes(); // Reload notes
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Memuat catatan...</Text>
      </View>
    );
  }

  if (notes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Belum ada catatan
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Mulai tambah catatan saat mempelajari modul
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/")}
          style={styles.browseButton}
        >
          Jelajahi Modul
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Catatan Saya ({notes.length})
        </Text>

        <View style={styles.filterContainer}>
          <Chip
            selected={filter === "all"}
            onPress={() => setFilter("all")}
            style={styles.chip}
          >
            Semua
          </Chip>
          <Chip
            selected={filter === "text"}
            onPress={() => setFilter("text")}
            style={styles.chip}
            icon="text"
          >
            Teks
          </Chip>
          <Chip
            selected={filter === "audio"}
            onPress={() => setFilter("audio")}
            style={styles.chip}
            icon="microphone"
          >
            Audio
          </Chip>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredNotes.map((note) => (
          <Card key={note.id} style={styles.card}>
            <Card.Content>
              <View style={styles.noteHeader}>
                <View style={styles.noteInfo}>
                  <Text variant="titleSmall" style={styles.moduleTitle}>
                    {note.module?.title || "Modul tidak ditemukan"}
                  </Text>
                  <View style={styles.noteMeta}>
                    <IconButton
                      icon={note.type === "audio" ? "microphone" : "text"}
                      size={16}
                      iconColor="#666"
                      style={styles.metaIcon}
                    />
                    <Text variant="bodySmall" style={styles.noteDate}>
                      {formatDate(note.createdAt)}
                    </Text>
                  </View>
                </View>

                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => deleteNote(note.id)}
                />
              </View>

              {note.type === "text" && note.content && (
                <Text
                  variant="bodyMedium"
                  style={styles.noteContent}
                  numberOfLines={3}
                >
                  {note.content}
                </Text>
              )}

              {note.type === "audio" && (
                <View style={styles.audioNote}>
                  <Button
                    mode="outlined"
                    icon="play"
                    compact
                    style={styles.audioButton}
                  >
                    Putar ({note.duration || 0}s)
                  </Button>
                </View>
              )}

              <Button
                mode="text"
                onPress={() => router.push(`/modules/${note.moduleId}`)}
                icon="arrow-right"
                style={styles.viewModuleButton}
              >
                Buka Modul
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  browseButton: {
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  noteInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  noteMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    margin: 0,
    marginRight: 4,
  },
  noteDate: {
    color: "#888",
  },
  noteContent: {
    lineHeight: 20,
    marginBottom: 12,
  },
  audioNote: {
    marginBottom: 12,
  },
  audioButton: {
    alignSelf: "flex-start",
  },
  viewModuleButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
});
