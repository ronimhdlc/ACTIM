import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Button, Text, ProgressBar, Menu, Divider } from "react-native-paper";
import { audioService } from "../services/audioService";
import { ModuleInterface } from "@/model/ModuleInterface";

const { width: screenWidth } = Dimensions.get("window");

interface EnhancedAudioPlayerProps {
  module: ModuleInterface;
}

export default function EnhancedAudioPlayer({
  module,
}: EnhancedAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [menuVisible, setMenuVisible] = useState(false);

  const playbackRates = [
    { label: "0.8x", value: 0.8 },
    { label: "1.0x", value: 1.0 },
    { label: "1.2x", value: 1.2 },
    { label: "1.5x", value: 1.5 },
  ];

  const loadAudio = useCallback(async () => {
    try {
      setIsLoading(true);
      await audioService.initializeAudioSession();

      // Load playback state
      const playbackState = await audioService.getPlaybackState(
        module.moduleId
      );
      if (playbackState) {
        setPosition(playbackState.position);
        setDuration(playbackState.duration);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
    } finally {
      setIsLoading(false);
    }
  }, [module.moduleId]);

  const playPause = async () => {
    if (!audioService) return;

    try {
      if (isPlaying) {
        await audioService.pause();
      } else {
        // Load audio if not already loaded
        if (position === 0) {
          await audioService.loadAndPlayAudio(
            module.moduleId,
            require(`@/assets/audio/${module.audioPath.replace(
              "assets/audio/",
              ""
            )}`)
          );
        }
        await audioService.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error playing/pausing audio:", error);
    }
  };

  const skip = async (seconds: number) => {
    try {
      await audioService.skip(seconds);
      // Update position manually for immediate feedback
      const newPosition = Math.max(
        0,
        Math.min(position + seconds * 1000, duration)
      );
      setPosition(newPosition);
    } catch (error) {
      console.error("Error skipping audio:", error);
    }
  };

  const seekTo = async (value: number) => {
    try {
      const newPosition = value * duration;
      await audioService.seekTo(newPosition);
      setPosition(newPosition);
    } catch (error) {
      console.error("Error seeking audio:", error);
    }
  };

  const changePlaybackRate = async (rate: number) => {
    try {
      await audioService.setPlaybackRate(rate);
      setPlaybackRate(rate);
      setMenuVisible(false);
    } catch (error) {
      console.error("Error changing playback rate:", error);
    }
  };

  // Simulate playback updates (in real app, this would come from audio service events)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        setPosition((prev) => {
          const newPosition = prev + 1000;
          return newPosition >= duration ? duration : newPosition;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  useEffect(() => {
    loadAudio();

    return () => {
      audioService.stopAudio();
    };
  }, [loadAudio]);

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Audio Modul
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              compact
            >
              {playbackRate}x
            </Button>
          }
        >
          {playbackRates.map((rate) => (
            <Menu.Item
              key={rate.value}
              onPress={() => changePlaybackRate(rate.value)}
              title={rate.label}
              leadingIcon={playbackRate === rate.value ? "check" : undefined}
            />
          ))}
        </Menu>
      </View>

      <ProgressBar
        progress={progress}
        style={styles.progressBar}
        color="#3498db"
      />

      <View style={styles.timeContainer}>
        <Text variant="bodyMedium" style={styles.timeText}>
          {audioService.formatTime(position)}
        </Text>
        <Text variant="bodyMedium" style={styles.timeText}>
          {audioService.formatTime(duration)}
        </Text>
      </View>

      <View style={styles.controls}>
        <Button
          mode="outlined"
          onPress={() => skip(-10)}
          disabled={!isPlaying && position === 0}
          icon="rewind-10"
          style={styles.controlButton}
        >
          -10s
        </Button>

        <Button
          mode="contained"
          onPress={playPause}
          disabled={isLoading}
          icon={isPlaying ? "pause" : "play"}
          style={[styles.controlButton, styles.playButton]}
          loading={isLoading}
        >
          {isPlaying ? "Jeda" : "Putar"}
        </Button>

        <Button
          mode="outlined"
          onPress={() => skip(10)}
          disabled={!isPlaying && position === duration}
          icon="fast-forward-10"
          style={styles.controlButton}
        >
          +10s
        </Button>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.infoContainer}>
        <Text variant="bodySmall" style={styles.infoText}>
          🎵 {module.title}
        </Text>
        <Text variant="bodySmall" style={styles.infoText}>
          ⚡ Kecepatan: {playbackRate}x
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
  },
  progressBar: {
    marginBottom: 8,
    height: 8,
    borderRadius: 4,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeText: {
    color: "#666",
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  controlButton: {
    minWidth: 100,
  },
  playButton: {
    minWidth: 120,
    backgroundColor: "#3498db",
  },
  divider: {
    marginVertical: 12,
  },
  infoContainer: {
    gap: 4,
  },
  infoText: {
    color: "#666",
  },
});
