import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Audio } from "expo-av";

export default function AudioPlayer({ source }: { source: string }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<any>(null);

  async function load() {
    const { sound } = await Audio.Sound.createAsync(
      require(`../../assets/audio/${source}`)
    );
    sound.setOnPlaybackStatusUpdate((s) => setStatus(s));
    setSound(sound);
  }

  useEffect(() => {
    load();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  return (
    <View>
      <Button
        mode="contained"
        onPress={() =>
          status?.isPlaying ? sound.pauseAsync() : sound.playAsync()
        }
      >
        {status?.isPlaying ? "Pause" : "Play"}
      </Button>
      <Text>
        {Math.floor(status?.positionMillis / 1000) || 0}s /{" "}
        {Math.floor(status?.durationMillis / 1000) || 0}s
      </Text>
    </View>
  );
}
