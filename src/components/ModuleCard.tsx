import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, IconButton } from "react-native-paper";
import { ModuleInterface } from "@/model/ModuleInterface";

interface ModuleCardProps {
  module: ModuleInterface;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  completed?: boolean;
}

export default function ModuleCard({
  module,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  completed = false,
}: ModuleCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {completed && (
              <IconButton
                icon="check-circle"
                size={20}
                iconColor="#2ecc71"
                style={styles.statusIcon}
              />
            )}
            <Text variant="titleSmall" style={styles.title}>
              {module.title}
            </Text>
          </View>

          {onToggleFavorite && (
            <IconButton
              icon={isFavorite ? "heart" : "heart-outline"}
              size={20}
              iconColor={isFavorite ? "#e74c3c" : "#666"}
              onPress={onToggleFavorite}
            />
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.audioBadge}>
            <IconButton
              icon="headphones"
              size={16}
              iconColor="#3498db"
              style={styles.audioIcon}
            />
            <Text variant="bodySmall" style={styles.audioText}>
              Audio tersedia
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.category}>
            {module.category}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    margin: 0,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  audioBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  audioIcon: {
    margin: 0,
    marginRight: 4,
  },
  audioText: {
    color: "#3498db",
    fontSize: 12,
  },
  category: {
    color: "#888",
    fontSize: 12,
  },
});
