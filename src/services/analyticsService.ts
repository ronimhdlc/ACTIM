import { StorageService } from "./storageService";

export interface AnalyticsEvent {
  type: string;
  data: any;
  timestamp: string;
}

export class AnalyticsService {
  private readonly MAX_EVENTS = 1000; // Prevent storage overflow

  async trackEvent(type: string, data: any = {}): Promise<void> {
    try {
      const events = await this.getEvents();

      const event: AnalyticsEvent = {
        type,
        data,
        timestamp: new Date().toISOString(),
      };

      events.push(event);

      // Keep only recent events
      if (events.length > this.MAX_EVENTS) {
        events.splice(0, events.length - this.MAX_EVENTS);
      }

      await StorageService.setItem("analytics_events", events);

      console.log("Event tracked:", type, data);
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  }

  async getEvents(): Promise<AnalyticsEvent[]> {
    return (
      (await StorageService.getItem<AnalyticsEvent[]>("analytics_events")) || []
    );
  }

  async getEventsByType(type: string): Promise<AnalyticsEvent[]> {
    const events = await this.getEvents();
    return events.filter((event) => event.type === type);
  }

  async clearEvents(): Promise<void> {
    await StorageService.setItem("analytics_events", []);
  }

  // Specific event tracking methods
  async trackModuleView(moduleId: string, pathwayId?: string): Promise<void> {
    await this.trackEvent("module_view", { moduleId, pathwayId });
  }

  async trackAudioPlay(moduleId: string, duration: number): Promise<void> {
    await this.trackEvent("audio_play", { moduleId, duration });
  }

  async trackNoteCreated(
    moduleId: string,
    type: "text" | "audio"
  ): Promise<void> {
    await this.trackEvent("note_created", { moduleId, type });
  }

  async trackFavoriteToggle(
    moduleId: string,
    isFavorite: boolean
  ): Promise<void> {
    await this.trackEvent("favorite_toggle", { moduleId, isFavorite });
  }

  async trackPathwayStart(pathwayId: string): Promise<void> {
    await this.trackEvent("pathway_start", { pathwayId });
  }

  async trackModuleComplete(
    moduleId: string,
    pathwayId: string
  ): Promise<void> {
    await this.trackEvent("module_complete", { moduleId, pathwayId });
  }

  // Analytics reports
  async getUsageReport(): Promise<{
    totalSessions: number;
    modulesCompleted: number;
    audioMinutes: number;
    notesCreated: number;
    favoritesAdded: number;
  }> {
    const events = await this.getEvents();

    const moduleCompletes = events.filter((e) => e.type === "module_complete");
    const audioPlays = events.filter((e) => e.type === "audio_play");
    const notesCreated = events.filter((e) => e.type === "note_created");
    const favoritesAdded = events.filter(
      (e) => e.type === "favorite_toggle" && e.data.isFavorite === true
    );

    const audioMinutes =
      audioPlays.reduce((total, event) => {
        return total + (event.data.duration || 0);
      }, 0) / 60;

    // Estimate sessions (group events by day)
    const sessions = new Set();
    events.forEach((event) => {
      const date = event.timestamp.split("T")[0];
      sessions.add(date);
    });

    return {
      totalSessions: sessions.size,
      modulesCompleted: moduleCompletes.length,
      audioMinutes: Math.round(audioMinutes),
      notesCreated: notesCreated.length,
      favoritesAdded: favoritesAdded.length,
    };
  }
}

export const analyticsService = new AnalyticsService();
