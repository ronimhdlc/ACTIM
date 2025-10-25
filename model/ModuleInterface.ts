export interface ModuleInterface {
  moduleId: string;
  title: string;
  markdownPath: string;
  audioPath: string;
  category: string;
}

export interface PathwayInterface {
  pathwayId: string;
  name: string;
  description: string;
  category: string;
  moduleIds: string[];
}

export interface FavoriteItem {
  moduleId: string;
  addedAt: string;
  module?: ModuleInterface;
}

export interface NoteItem {
  id: string;
  moduleId: string;
  type: "text" | "audio";
  content?: string;
  audioPath?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  module?: ModuleInterface;
}

export interface UserProgress {
  pathwayId: string;
  currentModuleIndex: number;
  completedModuleIds: string[];
  lastAccessed: string;
  totalModules: number;
  progressPercentage: number;
}

export interface PathwayWithProgress extends PathwayInterface {
  progress?: UserProgress;
}
