import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

interface MarkdownViewProps {
  content: string;
}

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold" as const,
    marginTop: 20,
    marginBottom: 10,
    color: "#2c3e50",
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold" as const,
    marginTop: 16,
    marginBottom: 8,
    color: "#34495e",
  },
  heading3: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 12,
    marginBottom: 6,
    color: "#34495e",
  },
  paragraph: {
    marginBottom: 12,
  },
  list_item: {
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  hr: {
    backgroundColor: "#bdc3c7",
    height: 1,
    marginVertical: 20,
  },
  blockquote: {
    backgroundColor: "#ecf0f1",
    borderLeftWidth: 4,
    borderLeftColor: "#bdc3c7",
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  code_inline: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 4,
    borderRadius: 3,
    fontFamily: "monospace",
  },
  code_block: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 5,
    marginBottom: 12,
    fontFamily: "monospace",
  },
};

export default function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <ScrollView style={styles.container}>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
