import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Card } from "react-native-elements";
import Icon from "react-native-vector-icons/Feather";
import { Doctor } from "../../../types";

interface DoctorCardProps {
  doctor: Doctor;
  onBookPress?: (doctor: Doctor) => void;
  onCallPress?: (doctor: Doctor) => void;
  onCardPress?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBookPress,
  onCallPress,
  onCardPress,
}) => {
  const getInitials = (name: string): string => {
    return name.split(" ").pop()?.charAt(0) || "D";
  };

  return (
    <TouchableOpacity onPress={() => onCardPress?.(doctor)} activeOpacity={0.9}>
      <Card containerStyle={styles.card}>
        <View style={styles.container}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatarContainer}>
              <Avatar
                rounded
                size={70}
                source={doctor.image ? { uri: doctor.image } : undefined}
                containerStyle={styles.avatar}
                title={getInitials(doctor.name)}
              />
              {doctor.isOnline && (
                <View style={styles.onlineIndicator}>
                  <View style={styles.onlineDot} />
                </View>
              )}
            </View>

            <View style={styles.details}>
              <View style={styles.nameSection}>
                <Text style={styles.name}>{doctor.name}</Text>
                <Text style={styles.specialty}>{doctor.specialty}</Text>
                <Text style={styles.clinic} numberOfLines={1}>
                  {doctor.clinic}
                </Text>
              </View>

              <View style={styles.priceRating}>
                <Text style={styles.price}>{doctor.price}</Text>
                <View style={styles.rating}>
                  <Icon name="star" size={18} color="#FBBF24" />
                  <Text style={styles.ratingText}>{doctor.rating}</Text>
                  <Text style={styles.reviewCount}>({doctor.reviews})</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="map-pin" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{doctor.distance}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="clock" size={18} color="#6B7280" />
                <Text style={styles.nextSlot}>{doctor.nextSlot}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => onCallPress?.(doctor)}
              >
                <Icon name="phone" size={18} color="#4B5563" />
              </TouchableOpacity>
              <Button
                title="Đặt lịch"
                buttonStyle={styles.bookButton}
                titleStyle={styles.bookButtonText}
                onPress={() => onBookPress?.(doctor)}
              />
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 0,
    overflow: "hidden",
  },
  container: {
    padding: 16,
  },
  doctorInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    borderWidth: 3,
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    backgroundColor: "#10B981",
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  details: {
    flex: 1,
    justifyContent: "space-between",
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
    marginBottom: 4,
  },
  clinic: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "400",
  },
  priceRating: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 4,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  reviewCount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  nextSlot: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginLeft: 6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});