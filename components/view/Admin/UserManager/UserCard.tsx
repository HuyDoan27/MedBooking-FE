import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const Icon = ({ name, size = 14, color = "#64748b" }) => {
  const icons = {
    eye: "👁️",
    mail: "✉️",
    phone: "📞",
    calendar: "📅",
    user: "👤",
    chevron: "›",
    star: "⭐",
  };
  return <Text style={{ fontSize: size }}>{icons[name] || "•"}</Text>;
};

export default function UserCard({ user, onPressDetail }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={onPressDetail}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={["#ffffff", "#f8fafc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.fullName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.statusDot} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.fullName}
            </Text>
            <View style={styles.statsPreview}>
              <Icon name="calendar" size={12} color="#0891b2" />
              <Text style={styles.statsText}>
                {user.totalAppointments || 0} lịch khám
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Icon name="mail" size={13} color="#0891b2" />
            </View>
            <Text style={styles.contactText} numberOfLines={1}>
              {user.email}
            </Text>
          </View>

          {user.phoneNumber && (
            <View style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Icon name="phone" size={13} color="#0891b2" />
              </View>
              <Text style={styles.contactText}>{user.phoneNumber}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {user.joinDate && (
            <View style={styles.joinBadge}>
              <Text style={styles.joinText}>
                Tham gia{" "}
                {new Date(user.joinDate).toLocaleDateString("vi-VN", {
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.viewButton}
            onPress={onPressDetail}
            activeOpacity={0.8}
          >
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Accent Corner */}
      <View style={styles.accentCorner} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  avatarSection: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#bae6fd",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0891b2",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    borderWidth: 2.5,
    borderColor: "#ffffff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  statsPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statsText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  contactSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  contactText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  joinBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flex: 1,
  },
  joinText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0891b2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  chevron: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "700",
  },
  accentCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: "#0891b2",
    opacity: 0.05,
    borderBottomLeftRadius: 60,
  },
});