import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, ProgressBar } from "react-native-paper";
import { PathwayInterface } from "@/model/ModuleInterface";

interface PathwayCardProps {
  pathway: PathwayInterface;
  onPress: () => void;
  progress?: number;
}

export default function PathwayCard({
  pathway,
  onPress,
  progress = 0,
}: PathwayCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          {pathway.name}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {pathway.description}
        </Text>
        <Text variant="bodySmall" style={styles.moduleCount}>
          {pathway.moduleIds.length} modul
        </Text>

        {progress > 0 && (
          <>
            <ProgressBar progress={progress} style={styles.progressBar} />
            <Text variant="bodySmall" style={styles.progressText}>
              {Math.round(progress * 100)}% selesai
            </Text>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#666",
    marginBottom: 8,
  },
  moduleCount: {
    color: "#888",
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 4,
    height: 6,
  },
  progressText: {
    color: "#2ecc71",
    textAlign: "right",
  },
});
