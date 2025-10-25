// src/components/AudioPlayer.tsx
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { Asset } from "expo-asset";

type Props = {
  source: string; // misal: "fundamentals_intro.mp3"
};

export default function AudioPlayer({ source }: Props) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // require statik untuk audio yang sudah di-bundle
        const asset = Asset.fromModule(`../../assets/audio/${source}`);
        await asset.downloadAsync();

        const { sound: s } = await Audio.Sound.createAsync(
          { uri: asset.localUri ?? "" },
          { shouldPlay: false }
        );

        s.setOnPlaybackStatusUpdate((st) => {
          // gunakan type guard
          if ("isPlaying" in st && active) setStatus(st);
        });

        if (active) setSound(s);
      } catch (err) {
        console.warn("Audio load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      (async () => {
        try {
          await sound?.unloadAsync();
        } catch {}
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTogglePlay = async () => {
    if (!sound) return;
    const st = await sound.getStatusAsync();
    if ("isPlaying" in st) {
      if (st.isPlaying) await sound.pauseAsync();
      else await sound.playAsync();
    }
  };

  const positionSeconds = Math.floor((status?.positionMillis ?? 0) / 1000);
  const durationSeconds = Math.floor((status?.durationMillis ?? 0) / 1000);

  if (loading) return <Text>Loading audio...</Text>;

  return (
    <View>
      <Button mode="contained" onPress={onTogglePlay} disabled={!sound}>
        {status?.isPlaying ? "Pause" : "Play"}
      </Button>

      <Text>
        {positionSeconds}s / {durationSeconds}s
      </Text>
    </View>
  );
}
