import { Audio } from "expo-av";
import { StorageService } from "./storageService";

export interface AudioPlaybackState {
  moduleId: string;
  position: number; // in milliseconds
  duration: number; // in milliseconds
  lastPlayed: string;
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentModuleId: string | null = null;

  // Initialize audio session
  async initializeAudioSession(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Error initializing audio session:", error);
    }
  }

  // Load and play audio
  async loadAndPlayAudio(moduleId: string, audioSource: any): Promise<void> {
    try {
      // Unload current sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Load playback state
      const playbackState = await this.getPlaybackState(moduleId);
      const initialPosition = playbackState?.position || 0;

      // Create new sound instance
      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        {
          shouldPlay: false,
          positionMillis: initialPosition,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.currentModuleId = moduleId;

      console.log("Audio loaded successfully for module:", moduleId);
    } catch (error) {
      console.error("Error loading audio:", error);
      throw new Error("Gagal memuat audio");
    }
  }

  // Play/pause toggle
  async playPause(): Promise<void> {
    if (!this.sound) return;

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await this.sound.pauseAsync();
        } else {
          await this.sound.playAsync();
        }
      }
    } catch (error) {
      console.error("Error playing/pausing audio:", error);
    }
  }

  // Seek to specific position
  async seekTo(position: number): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.setPositionAsync(position);
    } catch (error) {
      console.error("Error seeking audio:", error);
    }
  }

  // Skip forward/backward
  async skip(seconds: number): Promise<void> {
    if (!this.sound) return;

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.positionMillis !== undefined) {
        const newPosition = Math.max(0, status.positionMillis + seconds * 1000);
        await this.sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error("Error skipping audio:", error);
    }
  }

  // Set playback rate
  async setPlaybackRate(rate: number): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.setRateAsync(rate, true);
    } catch (error) {
      console.error("Error setting playback rate:", error);
    }
  }

  // Get current playback state
  async getCurrentStatus(): Promise<any> {
    if (!this.sound) return null;

    try {
      return await this.sound.getStatusAsync();
    } catch (error) {
      console.error("Error getting audio status:", error);
      return null;
    }
  }

  // Save playback state to storage
  private async savePlaybackState(
    moduleId: string,
    position: number,
    duration: number
  ): Promise<void> {
    try {
      const playbackState: AudioPlaybackState = {
        moduleId,
        position,
        duration,
        lastPlayed: new Date().toISOString(),
      };

      const allPlaybackStates =
        (await StorageService.getItem<Record<string, AudioPlaybackState>>(
          "audioPlaybackStates"
        )) || {};
      allPlaybackStates[moduleId] = playbackState;

      await StorageService.setItem("audioPlaybackStates", allPlaybackStates);
    } catch (error) {
      console.error("Error saving playback state:", error);
    }
  }

  // Get playback state from storage
  async getPlaybackState(moduleId: string): Promise<AudioPlaybackState | null> {
    try {
      const allPlaybackStates = await StorageService.getItem<
        Record<string, AudioPlaybackState>
      >("audioPlaybackStates");
      return allPlaybackStates?.[moduleId] || null;
    } catch (error) {
      console.error("Error getting playback state:", error);
      return null;
    }
  }

  // Playback status update callback
  private async onPlaybackStatusUpdate(status: any): Promise<void> {
    if (status.isLoaded && this.currentModuleId) {
      // Save playback state periodically (every 5 seconds or when paused)
      if (
        status.positionMillis &&
        status.durationMillis &&
        (status.didJustFinish || !status.isPlaying)
      ) {
        await this.savePlaybackState(
          this.currentModuleId,
          status.positionMillis,
          status.durationMillis
        );
      }
    }
  }

  // Stop and unload audio
  async stopAudio(): Promise<void> {
    if (this.sound) {
      try {
        // Save final position before unloading
        const status = await this.sound.getStatusAsync();
        if (
          status.isLoaded &&
          this.currentModuleId &&
          status.positionMillis &&
          status.durationMillis
        ) {
          await this.savePlaybackState(
            this.currentModuleId,
            status.positionMillis,
            status.durationMillis
          );
        }

        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentModuleId = null;
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    await this.stopAudio();
  }

  // Get formatted time string
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  // Calculate progress percentage
  calculateProgress(position: number, duration: number): number {
    if (!duration) return 0;
    return Math.min(position / duration, 1);
  }
}

// Export singleton instance
export const audioService = new AudioService();
