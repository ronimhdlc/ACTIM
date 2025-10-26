import Markdown from "react-native-markdown-display";
import { View } from "react-native";

export default function MarkdownView({ content }: { content: string }) {
  return (
    <View style={{ marginVertical: 8 }}>
      <Markdown>{content}</Markdown>
    </View>
  );
}
