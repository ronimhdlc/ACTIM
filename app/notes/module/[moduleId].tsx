import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, StyleSheet } from "react-native";
import {
  Text,
  Button,
  Card,
  FAB,
  Divider,
  IconButton,
} from "react-native-paper";
import { useEffect, useState } from "react";
import { loadModules } from "../../../src/services/markdownLoader";
import { StorageService } from "../../../src/services/storageService";
import { ModuleInterface, NoteItem } from "@/model/ModuleInterface";

export default function ModuleNotesScreen() {
  const { moduleId } = useLocalSearchParams();
  const router = useRouter();
  const [module, setModule] = useState<ModuleInterface>();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const loadData = async () => {
    try {
      const modules = await loadModules();
      const m = modules.find((x: any) => x.moduleId === moduleId);
      setModule(m);

      const moduleNotes = await StorageService.getNotesByModule(
        moduleId as string
      );
      setNotes(moduleNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAddNote = () => {
    router.push(`/notes/add/${moduleId}`);
  };

  const navigateToEditNote = (noteId: string) => {
    router.push(`/notes/edit/${noteId}`);
  };

  const deleteNote = async (noteId: string) => {
    try {
      await StorageService.deleteNote(noteId);
      await loadData(); // Reload notes
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text variant="headlineSmall" style={styles.title}>
          Catatan untuk: {module?.title}
        </Text>

        <Divider style={styles.divider} />

        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Belum ada catatan untuk modul ini.
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tambah catatan untuk merefleksikan pembelajaran Anda.
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <Card key={note.id} style={styles.noteCard}>
              <Card.Content>
                <View style={styles.noteHeader}>
                  <View style={styles.noteType}>
                    <IconButton
                      icon={note.type === "audio" ? "microphone" : "text"}
                      size={20}
                      iconColor="#666"
                    />
                    <Text variant="bodySmall" style={styles.noteTypeText}>
                      {note.type === "audio" ? "Catatan Audio" : "Catatan Teks"}
                    </Text>
                  </View>

                  <View style={styles.noteActions}>
                    <IconButton
                      icon="pencil"
                      size={16}
                      onPress={() => navigateToEditNote(note.id)}
                    />
                    <IconButton
                      icon="delete"
                      size={16}
                      onPress={() => deleteNote(note.id)}
                    />
                  </View>
                </View>

                <Text variant="bodySmall" style={styles.noteDate}>
                  {formatDate(note.createdAt)}
                </Text>

                {note.type === "text" && note.content && (
                  <Text variant="bodyMedium" style={styles.noteContent}>
                    {note.content}
                  </Text>
                )}

                {note.type === "audio" && (
                  <View style={styles.audioNote}>
                    <Button
                      mode="outlined"
                      icon="play"
                      onPress={() => {
                        /* Play audio logic */
                      }}
                      compact
                    >
                      Putar Audio ({note.duration || 0}s)
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={navigateToAddNote}
        label="Tambah Catatan"
      />
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
  divider: {
    marginVertical: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 8,
    color: "#666",
  },
  emptySubtext: {
    textAlign: "center",
    color: "#888",
  },
  noteCard: {
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteType: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteTypeText: {
    color: "#666",
  },
  noteActions: {
    flexDirection: "row",
  },
  noteDate: {
    color: "#888",
    marginBottom: 12,
    fontStyle: "italic",
  },
  noteContent: {
    lineHeight: 20,
  },
  audioNote: {
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
