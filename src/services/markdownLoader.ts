import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import jsyaml from "js-yaml";
import { ModuleInterface, PathwayInterface } from "@/model/ModuleInterface";

// Load asset helper
async function loadAssetContent(assetModule: any): Promise<string> {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error(`Asset localUri is null: ${assetModule}`);
  }
  return await FileSystem.readAsStringAsync(asset.localUri);
}

export async function loadModules(): Promise<ModuleInterface[]> {
  try {
    const raw = await loadAssetContent(require("@/assets/data/modules.yaml"));
    const data = jsyaml.load(raw) as any;
    return data.modules || [];
  } catch (error) {
    console.error("Error loading modules:", error);
    return [];
  }
}

export async function loadPathways(): Promise<PathwayInterface[]> {
  try {
    const raw = await loadAssetContent(require("@/assets/data/pathways.yaml"));
    const data = jsyaml.load(raw) as any;
    return data.pathways || [];
  } catch (error) {
    console.error("Error loading pathways:", error);
    return [];
  }
}

export async function loadMarkdown(path: string): Promise<string> {
  try {
    // Remove assets/ from path since it's already in assets folder
    const cleanPath = path.replace("assets/", "");
    const assetModule = require(`@/assets/${cleanPath}`);
    return await loadAssetContent(assetModule);
  } catch (error) {
    console.error("Error loading markdown:", error, path);
    return "# Konten tidak tersedia\n\nMohon maaf, konten sedang tidak dapat diakses.";
  }
}
