import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Card, ProgressBar } from "react-native-paper";
import { Audio } from "expo-av";
import { loadModules } from "../../../src/services/markdownLoader";
import { StorageService } from "../../../src/services/storageService";
import { ModuleInterface } from "@/model/ModuleInterface";

export default function RecordNoteScreen() {
  const { moduleId } = useLocalSearchParams();
  const router = useRouter();
  const [module, setModule] = useState<ModuleInterface>();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadModuleData();
    setupAudio();

    return () => {
      cleanup();
    };
  }, [moduleId]);

  const loadModuleData = async () => {
    try {
      const modules = await loadModules();
      const m = modules.find((x: any) => x.moduleId === moduleId);
      setModule(m);
    } catch (error) {
      console.error("Error loading module:", error);
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Error setting up audio:", error);
      Alert.alert("Error", "Tidak dapat mengakses mikrofon");
    }
  };

  const startRecording = async () => {
    try {
      setRecordingDuration(0);
      setRecordingUri(null);

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Gagal memulai rekaman");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecordingUri(uri);
      setIsRecording(false);
      setRecording(null);

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      console.log("Recording stopped and stored at", uri);
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Gagal menghentikan rekaman");
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Error playing recording:", error);
      Alert.alert("Error", "Gagal memutar rekaman");
    }
  };

  const stopPlaying = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const saveRecording = async () => {
    if (!recordingUri) {
      Alert.alert("Peringatan", "Tidak ada rekaman untuk disimpan");
      return;
    }

    if (recordingDuration < 5) {
      Alert.alert(
        "Peringatan",
        "Rekaman terlalu pendek (minimal 5 detik). Rekam ulang?",
        [
          { text: "Rekam Ulang", onPress: startRecording },
          { text: "Tetap Simpan", onPress: () => saveRecordingConfirmed() },
        ]
      );
      return;
    }

    saveRecordingConfirmed();
  };

  const saveRecordingConfirmed = async () => {
    setIsSubmitting(true);

    try {
      await StorageService.saveNote({
        moduleId: moduleId as string,
        type: "audio",
        audioPath: recordingUri,
        duration: recordingDuration,
      });

      Alert.alert("Berhasil", "Catatan audio berhasil disimpan", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving audio note:", error);
      Alert.alert("Error", "Gagal menyimpan catatan audio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCancel = () => {
    if (isRecording || recordingUri) {
      Alert.alert(
        "Batal Rekam",
        "Rekaman yang sudah dibuat akan hilang. Yakin ingin batal?",
        [
          { text: "Lanjutkan", style: "cancel" },
          {
            text: "Ya, Batal",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const cleanup = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    if (sound) {
      sound.unloadAsync();
    }
    if (recording) {
      recording.stopAndUnloadAsync();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!module) {
    return (
      <View style={styles.container}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Rekam Catatan Audio
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Modul: {module.title}
          </Text>

          <View style={styles.recordingSection}>
            {!recordingUri ? (
              <View style={styles.recordSection}>
                <Text variant="bodyLarge" style={styles.recordingStatus}>
                  {isRecording ? "🔴 Sedang Merekam..." : "Siap merekam"}
                </Text>

                <Text variant="displayMedium" style={styles.duration}>
                  {formatTime(recordingDuration)}
                </Text>

                {isRecording && (
                  <ProgressBar
                    progress={recordingDuration / 300} // Max 5 minutes
                    style={styles.progressBar}
                    color="#e74c3c"
                  />
                )}

                <View style={styles.recordButtons}>
                  {!isRecording ? (
                    <Button
                      mode="contained"
                      onPress={startRecording}
                      icon="record-circle"
                      style={styles.recordButton}
                      buttonColor="#e74c3c"
                    >
                      Mulai Rekam
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={stopRecording}
                      icon="stop"
                      style={styles.recordButton}
                      buttonColor="#e74c3c"
                    >
                      Stop Rekam
                    </Button>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.playbackSection}>
                <Text variant="bodyLarge" style={styles.playbackStatus}>
                  ✅ Rekaman Selesai
                </Text>

                <Text variant="titleMedium" style={styles.finalDuration}>
                  Durasi: {formatTime(recordingDuration)}
                </Text>

                <View style={styles.playbackButtons}>
                  {!isPlaying ? (
                    <Button
                      mode="outlined"
                      onPress={playRecording}
                      icon="play"
                      style={styles.playbackButton}
                    >
                      Putar
                    </Button>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={stopPlaying}
                      icon="stop"
                      style={styles.playbackButton}
                    >
                      Stop
                    </Button>
                  )}

                  <Button
                    mode="outlined"
                    onPress={startRecording}
                    icon="refresh"
                    style={styles.playbackButton}
                  >
                    Rekam Ulang
                  </Button>
                </View>
              </View>
            )}
          </View>

          <Text variant="bodySmall" style={styles.tips}>
            🎤 Tips:
            {!recordingUri
              ? " Rekam refleksi atau insight dalam 1-2 menit untuk hasil terbaik"
              : " Dengarkan kembali sebelum menyimpan"}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.actionCard}>
        <Card.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={confirmCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>

          <Button
            mode="contained"
            onPress={saveRecording}
            loading={isSubmitting}
            disabled={isSubmitting || !recordingUri}
            icon="content-save"
          >
            Simpan
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  recordingSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordSection: {
    alignItems: "center",
    width: "100%",
  },
  playbackSection: {
    alignItems: "center",
    width: "100%",
  },
  recordingStatus: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  playbackStatus: {
    marginBottom: 16,
    fontWeight: "bold",
    color: "#27ae60",
  },
  duration: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  finalDuration: {
    marginBottom: 30,
    color: "#666",
  },
  progressBar: {
    width: "80%",
    height: 8,
    marginBottom: 30,
  },
  recordButtons: {
    marginTop: 20,
  },
  recordButton: {
    minWidth: 200,
  },
  playbackButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  playbackButton: {
    minWidth: 120,
  },
  tips: {
    marginTop: 30,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  actionCard: {
    marginTop: 20,
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
});
