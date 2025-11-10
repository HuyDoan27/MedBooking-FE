import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SpecialtyCardProps {
  specialty: {
    name: string;
    color: string;
    textColor: string;
    image?: string;
  };
  onPress?: (specialty: any) => void;
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(specialty)}
    >
      <View style={styles.card}>
        <View style={[styles.iconContainer]}>
          <Image
            source={specialty.image}
            style={styles.iconImage}
            resizeMode="contain"
          />

        </View>
        <Text style={styles.title}>{specialty.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "33%",
    marginBottom: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  iconContainer: {
    height: 80,
    width: 80,            // làm vuông để ảnh fit tốt
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",   // tránh ảnh tràn ra ngoài
  },

  iconImage: {
    width: "100%",      // chiếm toàn bộ chiều rộng của container
    height: "100%",     // chiếm toàn bộ chiều cao của container
  },

  title: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },
});
