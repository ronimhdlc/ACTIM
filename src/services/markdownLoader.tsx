import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import yaml from "js-yaml";

export async function loadModules() {
  const raw = await FileSystem.readAsStringAsync(
    Asset.fromModule(require("../../assets/data/modules.yaml")).localUri!
  );
  return (yaml.load(raw) as any).modules;
}

export async function loadPathways() {
  const raw = await FileSystem.readAsStringAsync(
    Asset.fromModule(require("../../assets/data/pathways.yaml")).localUri!
  );
  return (yaml.load(raw) as any).pathways;
}

export async function loadMarkdown(path: string) {
  const asset = Asset.fromModule(require(`../../${path}`));
  await asset.downloadAsync();
  return await FileSystem.readAsStringAsync(asset.localUri!);
}
