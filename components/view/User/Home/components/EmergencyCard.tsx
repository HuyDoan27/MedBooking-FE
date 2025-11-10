import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-elements";
import Icon from "react-native-vector-icons/Feather";

interface EmergencyCardProps {
  onPress?: () => void;
  emergencyNumbers?: string[];
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  onPress,
  emergencyNumbers = ["115", "113"],
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card containerStyle={styles.card}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Icon name="phone" size={32} color="white" />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Cấp cứu 24/7</Text>
            <Text style={styles.subtitle}>
              Gọi ngay khi cần hỗ trợ khẩn cấp
            </Text>
            <View style={styles.numberContainer}>
              {emergencyNumbers.map((number, index) => (
                <View key={index} style={styles.numberBadge}>
                  <Text style={styles.numberText}>{number}</Text>
                </View>
              ))}
            </View>
          </View>
          <Icon
            name="chevron-right"
            size={24}
            color="rgba(255, 255, 255, 0.7)"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#EF4444",
    marginLeft: -10,
    marginRight: -10,
    borderRadius: 16,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 0,
    overflow: "hidden",
    marginBottom: 40,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    marginBottom: 8,
  },
  numberContainer: {
    flexDirection: "row",
    gap: 12,
  },
  numberBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  numberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
