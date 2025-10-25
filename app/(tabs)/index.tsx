import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { ScrollView, View, StyleSheet, RefreshControl } from "react-native";
import {
  Button,
  Card,
  Text,
  Searchbar,
  ProgressBar,
  Chip,
} from "react-native-paper";
import { loadPathways, loadModules } from "../../src/services/markdownLoader";
import { StorageService } from "../../src/services/storageService";
import { searchService } from "../../src/services/searchService";
import { PathwayWithProgress, ModuleInterface } from "@/model/ModuleInterface";
import PathwayCard from "../../src/components/PathwayCard";

export default function HomeScreen() {
  const router = useRouter();
  const [pathways, setPathways] = useState<PathwayWithProgress[]>([]);
  const [modules, setModules] = useState<ModuleInterface[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    pathways: PathwayWithProgress[];
    modules: ModuleInterface[];
  }>({ pathways: [], modules: [] });

  const loadData = useCallback(async () => {
    try {
      const [pathwaysData, modulesData] = await Promise.all([
        loadPathways(),
        loadModules(),
      ]);

      // Add progress to pathways
      const pathwaysWithProgress = await Promise.all(
        pathwaysData.map(async (pathway) => {
          const progress = await StorageService.getPathwayProgress(
            pathway.pathwayId
          );
          return { ...pathway, progress };
        })
      );

      setPathways(pathwaysWithProgress);
      setModules(modulesData);

      // Calculate overall progress
      const progress = await StorageService.getOverallProgress(modulesData);
      setOverallProgress(progress);

      // Initialize search
      searchService.initializeSearch(modulesData, pathwaysData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchService.searchAll(searchQuery);
      const pathwaysWithProgress = results.pathways.map((pathway) => ({
        ...pathway,
        progress: pathways.find((p) => p.pathwayId === pathway.pathwayId)
          ?.progress,
      }));

      setSearchResults({
        pathways: pathwaysWithProgress,
        modules: results.modules,
      });
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, pathways]);

  const displayPathways = showSearchResults ? searchResults.pathways : pathways;
  const displayModules = showSearchResults ? searchResults.modules : [];

  const continueLastModule = async () => {
    // Find the most recently accessed pathway
    const progressData = await StorageService.getProgress();
    const recentPathway = Object.values(progressData).sort(
      (a, b) =>
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    )[0];

    if (recentPathway) {
      router.push(`/pathways/${recentPathway.pathwayId}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.welcomeTitle}>
          Selamat Datang
        </Text>
        <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
          Teruslah belajar dan berkembang
        </Text>

        {/* Overall Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <Text variant="titleMedium">Progress Keseluruhan</Text>
              <Text variant="titleMedium" style={styles.progressPercentage}>
                {Math.round(overallProgress * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={overallProgress}
              style={styles.overallProgressBar}
              color="#2ecc71"
            />
            <Button
              mode="text"
              onPress={continueLastModule}
              icon="play-circle"
              style={styles.continueButton}
            >
              Lanjutkan Belajar
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Search Section */}
      <Searchbar
        placeholder="Cari pathway atau modul..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        icon={showSearchResults ? "close" : "magnify"}
        onIconPress={() => {
          if (showSearchResults) {
            setSearchQuery("");
          }
        }}
      />

      {/* Search Results Info */}
      {showSearchResults && (
        <View style={styles.searchInfo}>
          <Chip icon="magnify" mode="outlined">
            {displayPathways.length + displayModules.length} hasil untuk "
            {searchQuery}"
          </Chip>
        </View>
      )}

      {/* Module Search Results */}
      {showSearchResults && displayModules.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Modul ({displayModules.length})
          </Text>
          {displayModules.map((module) => (
            <Card
              key={module.moduleId}
              style={styles.moduleCard}
              onPress={() => router.push(`/modules/${module.moduleId}`)}
            >
              <Card.Content>
                <Text variant="titleSmall">{module.title}</Text>
                <Text variant="bodySmall" style={styles.moduleCategory}>
                  {module.category}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Pathways Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {showSearchResults ? "Pathway Ditemukan" : "Jalur Belajar"}
          {!showSearchResults && ` (${pathways.length})`}
        </Text>

        {displayPathways.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {showSearchResults
                  ? "Tidak ada pathway yang sesuai dengan pencarian"
                  : "Belum ada pathway tersedia"}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          displayPathways.map((pathway) => (
            <PathwayCard
              key={pathway.pathwayId}
              pathway={pathway}
              progress={pathway.progress?.progressPercentage}
              onPress={() => router.push(`/pathways/${pathway.pathwayId}`)}
            />
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Akses Cepat
        </Text>
        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            icon="heart"
            onPress={() => router.push("/favorites")}
            style={styles.quickAction}
          >
            Favorit
          </Button>
          <Button
            mode="outlined"
            icon="note"
            onPress={() => router.push("/notes")}
            style={styles.quickAction}
          >
            Catatan
          </Button>
          <Button
            mode="outlined"
            icon="help-circle"
            onPress={() => router.push("/help")}
            style={styles.quickAction}
          >
            Bantuan
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  welcomeTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: "#666",
    marginBottom: 16,
  },
  progressCard: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressPercentage: {
    color: "#2ecc71",
    fontWeight: "bold",
  },
  overallProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  continueButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  searchBar: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  searchInfo: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  moduleCard: {
    marginBottom: 8,
  },
  moduleCategory: {
    color: "#666",
    marginTop: 4,
  },
  emptyCard: {
    marginBottom: 12,
    backgroundColor: "#f8f9fa",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  quickAction: {
    flex: 1,
  },
});
