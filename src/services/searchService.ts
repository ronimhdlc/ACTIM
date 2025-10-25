import { ModuleInterface, PathwayInterface } from "@/model/ModuleInterface";
import Fuse from "fuse.js";

export class SearchService {
  private moduleFuse?: Fuse<ModuleInterface>;
  private pathwayFuse?: Fuse<PathwayInterface>;

  initializeSearch(modules: ModuleInterface[], pathways: PathwayInterface[]) {
    // Configure Fuse.js for fuzzy search
    const moduleOptions = {
      keys: [
        { name: "title", weight: 0.7 },
        { name: "category", weight: 0.3 },
      ],
      threshold: 0.3,
      includeScore: true,
    };

    const pathwayOptions = {
      keys: [
        { name: "name", weight: 0.6 },
        { name: "description", weight: 0.4 },
      ],
      threshold: 0.4,
      includeScore: true,
    };

    this.moduleFuse = new Fuse(modules, moduleOptions);
    this.pathwayFuse = new Fuse(pathways, pathwayOptions);
  }

  searchModules(query: string): ModuleInterface[] {
    if (!this.moduleFuse || !query.trim()) return [];

    const results = this.moduleFuse.search(query);
    return results.map((result) => result.item);
  }

  searchPathways(query: string): PathwayInterface[] {
    if (!this.pathwayFuse || !query.trim()) return [];

    const results = this.pathwayFuse.search(query);
    return results.map((result) => result.item);
  }

  searchAll(query: string): {
    modules: ModuleInterface[];
    pathways: PathwayInterface[];
  } {
    return {
      modules: this.searchModules(query),
      pathways: this.searchPathways(query),
    };
  }
}

export const searchService = new SearchService();
