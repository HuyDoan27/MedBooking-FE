import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  const getStatusStyle = (status) => {
    const statusMap = {
      completed: { bg: "#dcfce7", text: "#15803d", label: "Hoàn thành" },
      confirmed: { bg: "#dbeafe", text: "#1e40af", label: "Đã xác nhận" },
      pending: { bg: "#fef3c7", text: "#92400e", label: "Chờ xác nhận" },
      cancelled: { bg: "#fee2e2", text: "#991b1b", label: "Đã hủy" },
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <Modal
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Vùng bấm ra ngoài để đóng modal */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Vùng modal cuộn được */}
        <View style={styles.modalContainer}>
          <View style={styles.dragHandle} />

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            bounces={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Thông tin người dùng */}
            <View style={styles.userInfoCard}>
              <Text style={styles.userName} numberOfLines={2}>
                {user.fullName}
              </Text>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>✉️</Text>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>📱</Text>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={styles.infoValue}>
                    {user.phoneNumber || "Chưa cập nhật"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Lịch sử khám */}
            <View style={styles.appointmentsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Lịch sử khám bệnh</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {user.appointments?.length || 0}
                  </Text>
                </View>
              </View>

              {!user.appointments || user.appointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyText}>Chưa có lịch khám nào</Text>
                  <Text style={styles.emptySubtext}>
                    Lịch sử khám bệnh sẽ hiển thị ở đây
                  </Text>
                </View>
              ) : (
                <View style={styles.appointmentsList}>
                  {user.appointments.map((appointment, idx) => {
                    const statusStyle = getStatusStyle(appointment.status);
                    return (
                      <View key={idx} style={styles.appointmentCard}>
                        <View style={styles.appointmentHeader}>
                          <View style={styles.clinicInfo}>
                            <Text style={styles.clinicEmoji}>🏥</Text>
                            <Text style={styles.clinicName} numberOfLines={2}>
                              {appointment.clinic}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusStyle.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: statusStyle.text },
                              ]}
                            >
                              {statusStyle.label}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.appointmentDetails}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailEmoji}>👨‍⚕️</Text>
                            <Text style={styles.detailText} numberOfLines={1}>
                              Bác sĩ {appointment.doctor}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailEmoji}>📅</Text>
                            <Text style={styles.detailText}>
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString("vi-VN", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailEmoji}>🕐</Text>
                            <Text style={styles.detailText}>
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Nút đóng */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width,
    height: height * 0.9,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 16 },
    }),
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#cbd5e1",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  userInfoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginBottom: 14 },
  infoRow: { flexDirection: "row", marginBottom: 12 },
  infoEmoji: { fontSize: 18, marginRight: 10 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#64748b", marginBottom: 3 },
  infoValue: { fontSize: 14, color: "#0f172a", fontWeight: "500" },
  appointmentsSection: { marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  countBadge: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: { color: "#fff", fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 36 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#475569" },
  emptySubtext: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  appointmentsList: { gap: 10 },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  appointmentHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  clinicInfo: { flexDirection: "row", flex: 1 },
  clinicEmoji: { fontSize: 16, marginRight: 8 },
  clinicName: { fontSize: 14, fontWeight: "600", color: "#0f172a", flex: 1 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },
  appointmentDetails: { gap: 7 },
  detailRow: { flexDirection: "row", alignItems: "center" },
  detailEmoji: { fontSize: 13, marginRight: 8 },
  detailText: { fontSize: 13, color: "#475569" },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  actionButton: {
    backgroundColor: "#0891b2",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
