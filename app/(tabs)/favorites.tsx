import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, Card, Button, IconButton } from "react-native-paper";
import { loadModules } from "../../src/services/markdownLoader";
import { StorageService } from "../../src/services/storageService";
import { FavoriteItem } from "@/model/ModuleInterface";

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const modules = await loadModules();
      const favs = await StorageService.getFavoritesWithDetails(modules);
      setFavorites(favs);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (moduleId: string) => {
    try {
      await StorageService.toggleFavorite(moduleId);
      await loadFavorites(); // Reload favorites
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const navigateToModule = (moduleId: string) => {
    router.push(`/modules/${moduleId}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Memuat favorit...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Belum ada favorit
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Tambah modul ke favorit untuk akses cepat
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
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Modul Favorit ({favorites.length})
      </Text>

      {favorites.map((fav) => (
        <Card key={fav.moduleId} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.moduleTitle}>
                {fav.module?.title}
              </Text>
              <IconButton
                icon="heart"
                size={20}
                iconColor="#e74c3c"
                onPress={() => removeFavorite(fav.moduleId)}
              />
            </View>

            <Text variant="bodyMedium" style={styles.moduleCategory}>
              Kategori: {fav.module?.category}
            </Text>

            <Text variant="bodySmall" style={styles.addedDate}>
              Ditambahkan: {new Date(fav.addedAt).toLocaleDateString("id-ID")}
            </Text>

            <Button
              mode="contained"
              onPress={() => navigateToModule(fav.moduleId)}
              style={styles.openButton}
              icon="book-open"
            >
              Buka Modul
            </Button>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 16,
    fontWeight: "bold",
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
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  moduleTitle: {
    flex: 1,
    fontWeight: "600",
    marginRight: 8,
  },
  moduleCategory: {
    color: "#666",
    marginBottom: 4,
  },
  addedDate: {
    color: "#888",
    fontStyle: "italic",
    marginBottom: 12,
  },
  openButton: {
    marginTop: 8,
  },
});
