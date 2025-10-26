// src/services/markdownLoader.ts
import * as FileSystem from "expo-file-system/legacy"; // ✅ hindari deprecated warning
import { Asset } from "expo-asset";
import * as yaml from "js-yaml";
import { markdownManifest } from "../data/markdownManifest";

export async function loadModules() {
  try {
    const asset = Asset.fromModule(require("../../assets/data/modules.yaml"));
    await asset.downloadAsync();

    // gunakan legacy API yang stabil
    const raw = await FileSystem.readAsStringAsync(asset.localUri ?? "");
    const parsed = yaml.load(raw) as any;
    return parsed?.modules ?? [];
  } catch (err) {
    console.error("Failed to load modules:", err);
    return [];
  }
}

export async function loadPathways() {
  try {
    const asset = Asset.fromModule(require("../../assets/data/pathways.yaml"));
    await asset.downloadAsync();

    const raw = await FileSystem.readAsStringAsync(asset.localUri ?? "");
    const parsed = yaml.load(raw) as any;
    return parsed?.pathways ?? [];
  } catch (err) {
    console.error("Failed to load pathways:", err);
    return [];
  }
}

export async function loadMarkdown(filename: string) {
  try {
    const asset = markdownManifest[filename];
    if (!asset) {
      console.warn("Markdown not found in manifest:", filename);
      return "";
    }

    const file = Asset.fromModule(asset);
    await file.downloadAsync();
    return await FileSystem.readAsStringAsync(file.localUri ?? "");
  } catch (err) {
    console.error("Failed to load markdown:", err);
    return "";
  }
}
