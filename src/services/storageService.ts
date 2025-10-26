import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PROGRESS = "actim_progress";
const KEY_FAVORITES = "actim_favorites";
const KEY_NOTES = "actim_notes";

export async function saveProgress(moduleId: string, positionMillis: number) {
  const json = await AsyncStorage.getItem(KEY_PROGRESS);
  const obj = json ? JSON.parse(json) : {};
  obj[moduleId] = positionMillis;
  await AsyncStorage.setItem(KEY_PROGRESS, JSON.stringify(obj));
}

export async function loadProgress(moduleId: string) {
  const json = await AsyncStorage.getItem(KEY_PROGRESS);
  const obj = json ? JSON.parse(json) : {};
  return obj[moduleId] ?? 0;
}

export async function toggleFavorite(moduleId: string) {
  const json = await AsyncStorage.getItem(KEY_FAVORITES);
  const arr: string[] = json ? JSON.parse(json) : [];
  const exists = arr.includes(moduleId);
  const newArr = exists
    ? arr.filter((id) => id !== moduleId)
    : [...arr, moduleId];
  await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(newArr));
  return !exists;
}

export async function getFavorites(): Promise<string[]> {
  const json = await AsyncStorage.getItem(KEY_FAVORITES);
  return json ? JSON.parse(json) : [];
}

export async function saveNote(moduleId: string, text: string) {
  const json = await AsyncStorage.getItem(KEY_NOTES);
  const obj = json ? JSON.parse(json) : {};
  obj[moduleId] = text;
  await AsyncStorage.setItem(KEY_NOTES, JSON.stringify(obj));
}

export async function loadNote(moduleId: string): Promise<string> {
  const json = await AsyncStorage.getItem(KEY_NOTES);
  const obj = json ? JSON.parse(json) : {};
  return obj[moduleId] ?? "";
}
