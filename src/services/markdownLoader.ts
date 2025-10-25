// src/services/markdownLoader.ts
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as yaml from "js-yaml";

export async function loadModules() {
  const asset = Asset.fromModule(require("../../assets/data/modules.yaml"));
  await asset.downloadAsync();
  const raw = await FileSystem.readAsStringAsync(asset.localUri ?? "");
  const parsed = yaml.load(raw) as any;
  return parsed?.modules ?? [];
}

export async function loadPathways() {
  const asset = Asset.fromModule(require("../../assets/data/pathways.yaml"));
  await asset.downloadAsync();
  const raw = await FileSystem.readAsStringAsync(asset.localUri ?? "");
  const parsed = yaml.load(raw) as any;
  return parsed?.pathways ?? [];
}

export async function loadMarkdown(markdownPath: string) {
  try {
    const asset = Asset.fromModule(`../../${markdownPath}`);
    await asset.downloadAsync();
    const content = await FileSystem.readAsStringAsync(asset.localUri ?? "");
    return content;
  } catch (e) {
    console.warn(
      "Failed to load markdown via static require. Ensure path is bundled:",
      markdownPath,
      e
    );
    // Fallback: attempt to read via FileSystem if markdownPath is a file URI
    try {
      return await FileSystem.readAsStringAsync(markdownPath);
    } catch (err) {
      console.warn("fallback read failed:", err);
      return "";
    }
  }
}
