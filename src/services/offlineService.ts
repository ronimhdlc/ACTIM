import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";

export class OfflineService {
  private isConnected: boolean = true;

  constructor() {
    this.initializeNetworkListener();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener((state) => {
      this.isConnected = state.isConnected ?? true;
      console.log("Network state changed:", this.isConnected);
    });
  }

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? true;
  }

  async cacheAssets(): Promise<void> {
    try {
      // Cache YAML files
      const modulesYaml = require("@/assets/data/modules.yaml");
      const pathwaysYaml = require("@/assets/data/pathways.yaml");

      await Promise.all([
        Asset.fromModule(modulesYaml).downloadAsync(),
        Asset.fromModule(pathwaysYaml).downloadAsync(),
      ]);

      // Cache markdown files (you would need to dynamically require all markdown files)
      console.log("Assets cached for offline use");
    } catch (error) {
      console.error("Error caching assets:", error);
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  }

  async setCachedData<T>(key: string, data: T): Promise<void> {
    try {
      const cache = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cache));
    } catch (error) {
      console.error("Error setting cached data:", error);
    }
  }

  async clearOldCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("cache_"));

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
            // 7 days
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("Error clearing old cache:", error);
    }
  }
}

export const offlineService = new OfflineService();
