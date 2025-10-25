import {
  FavoriteItem,
  ModuleInterface,
  NoteItem,
  UserProgress,
} from "@/model/ModuleInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageService {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error reading data:", error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
    }
  }

  // Favorite methods
  static async getFavorites(): Promise<string[]> {
    return (await this.getItem<string[]>("favorites")) || [];
  }

  static async toggleFavorite(moduleId: string): Promise<string[]> {
    const favorites = await this.getFavorites();
    const newFavorites = favorites.includes(moduleId)
      ? favorites.filter((id) => id !== moduleId)
      : [...favorites, moduleId];

    await this.setItem("favorites", newFavorites);
    return newFavorites;
  }

  // Notes methods
  static async getNotes(): Promise<any[]> {
    return (await this.getItem<any[]>("notes")) || [];
  }

  static async saveNote(note: any): Promise<any[]> {
    const notes = await this.getNotes();
    const newNotes = [
      ...notes,
      { ...note, id: Date.now().toString(), createdAt: new Date() },
    ];
    await this.setItem("notes", newNotes);
    return newNotes;
  }

  // Progress methods
  static async getProgress(): Promise<Record<string, UserProgress>> {
    return (
      (await this.getItem<Record<string, UserProgress>>("userProgress")) || {}
    );
  }

  static async updateModuleProgress(
    pathwayId: string,
    moduleId: string,
    modules: ModuleInterface[]
  ): Promise<UserProgress> {
    const progress = await this.getProgress();
    const pathwayModules = modules.filter(
      (m) =>
        modules.find((mod) => mod.moduleId === moduleId)?.category ===
        modules.find((mod) => mod.moduleId === moduleId)?.category
    );

    if (!progress[pathwayId]) {
      progress[pathwayId] = {
        pathwayId,
        currentModuleIndex: 0,
        completedModuleIds: [],
        lastAccessed: new Date().toISOString(),
        totalModules: pathwayModules.length,
        progressPercentage: 0,
      };
    }

    const pathwayProgress = progress[pathwayId];

    // Update current module index
    const currentIndex = pathwayModules.findIndex(
      (m) => m.moduleId === moduleId
    );
    if (currentIndex !== -1) {
      pathwayProgress.currentModuleIndex = currentIndex;
    }

    // Add to completed if not already
    if (!pathwayProgress.completedModuleIds.includes(moduleId)) {
      pathwayProgress.completedModuleIds.push(moduleId);
    }

    // Update progress percentage
    pathwayProgress.progressPercentage =
      pathwayProgress.completedModuleIds.length / pathwayProgress.totalModules;

    pathwayProgress.lastAccessed = new Date().toISOString();

    await this.setItem("userProgress", progress);
    return pathwayProgress;
  }

  static async getPathwayProgress(
    pathwayId: string
  ): Promise<UserProgress | null> {
    const progress = await this.getProgress();
    return progress[pathwayId] || null;
  }

  static async getOverallProgress(modules: ModuleInterface[]): Promise<number> {
    const progress = await this.getProgress();
    const allModuleIds = modules.map((m) => m.moduleId);
    const completedModules = new Set<string>();

    Object.values(progress).forEach((pathwayProgress: UserProgress) => {
      pathwayProgress.completedModuleIds.forEach((id) =>
        completedModules.add(id)
      );
    });

    return allModuleIds.length > 0
      ? completedModules.size / allModuleIds.length
      : 0;
  }

  static async getFavoritesWithDetails(
    modules: ModuleInterface[]
  ): Promise<FavoriteItem[]> {
    const favoriteIds = await this.getFavorites();
    const favorites: FavoriteItem[] = [];

    favoriteIds.forEach((moduleId) => {
      const module = modules.find((m) => m.moduleId === moduleId);
      if (module) {
        favorites.push({
          moduleId,
          addedAt: new Date().toISOString(),
          module,
        });
      }
    });

    return favorites;
  }

  static async isFavorite(moduleId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(moduleId);
  }

  // Enhanced Notes methods
  static async getNotesByModule(moduleId: string): Promise<NoteItem[]> {
    const notes = await this.getNotes();
    return notes
      .filter((note) => note.moduleId === moduleId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  static async getNotesWithDetails(
    modules: ModuleInterface[]
  ): Promise<NoteItem[]> {
    const notes = await this.getNotes();
    return notes
      .map((note) => ({
        ...note,
        module: modules.find((m) => m.moduleId === note.moduleId),
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  static async deleteNote(noteId: string): Promise<any[]> {
    const notes = await this.getNotes();
    const newNotes = notes.filter((note) => note.id !== noteId);
    await this.setItem("notes", newNotes);
    return newNotes;
  }

  static async updateNote(
    noteId: string,
    updates: Partial<NoteItem>
  ): Promise<any[]> {
    const notes = await this.getNotes();
    const noteIndex = notes.findIndex((note) => note.id === noteId);

    if (noteIndex !== -1) {
      notes[noteIndex] = {
        ...notes[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.setItem("notes", notes);
    }

    return notes;
  }
}
