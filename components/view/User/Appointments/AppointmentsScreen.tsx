import { getUserAppointments } from "@/services/AppointmentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CreateAppointmentModal from "./components/CreateAppointmentModal";

const getStatusConfig = (status) => {
  switch (status) {
    case "confirmed":
      return {
        text: "Đã xác nhận",
        color: "#16a34a",
        bgColor: "#dcfce7",
        icon: "checkmark-circle",
      };
    case "pending":
      return {
        text: "Chờ xác nhận",
        color: "#ca8a04",
        bgColor: "#fef3c7",
        icon: "time",
      };
    case "completed":
      return {
        text: "Đã khám",
        color: "#0891b2",
        bgColor: "#dbeafe",
        icon: "checkmark-done-circle",
      };
    case "cancelled":
      return {
        text: "Đã hủy",
        color: "#dc2626",
        bgColor: "#fee2e2",
        icon: "close-circle",
      };
    case "rescheduled":
      return {
        text: "Đã dời lịch",
        color: "#7c3aed",
        bgColor: "#ede9fe",
        icon: "calendar",
      };
    default:
      return {
        text: status,
        color: "#6b7280",
        bgColor: "#f3f4f6",
        icon: "help-circle",
      };
  }
};

export default function EnhancedAppointmentsScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [activeTab]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user._id);

        let statusParam = "upcoming";
        if (activeTab === "completed") statusParam = "completed";
        if (activeTab === "cancelled") statusParam = "cancelled";
        if (activeTab === "pending") statusParam = "pending";

        const params = {
          status: statusParam,
          page: 1,
          limit: 10,
        };
        const response = await getUserAppointments(user._id, params);
        setAppointments(response.data.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách lịch hẹn. Vui lòng thử lại.");
      console.error("Error loading:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderAppointmentCard = (item) => {
    const status = getStatusConfig(item.status);

    return (
      <View key={item._id} style={styles.appointmentCard}>
        {/* Header: Trạng thái & Thanh toán */}
        <View style={styles.appointmentHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons
              name={status.icon}
              size={20}
              color={status.color}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{ color: status.color, fontWeight: "bold", fontSize: 16 }}
            >
              {status.text}
            </Text>
          </View>

          <View
            style={{
              backgroundColor:
                item.paymentStatus === "unpaid" ? "#fef3c7" : "#dcfce7",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons
              name={
                item.paymentStatus === "unpaid"
                  ? "card-outline"
                  : "checkmark-circle"
              }
              size={16}
              color={item.paymentStatus === "unpaid" ? "#ca8a04" : "#16a34a"}
            />
            <Text
              style={{
                color: item.paymentStatus === "unpaid" ? "#ca8a04" : "#16a34a",
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {item.paymentStatus === "unpaid"
                ? "Chưa thanh toán"
                : "Đã thanh toán"}
            </Text>
          </View>
        </View>

        {/* Thông tin lịch hẹn chính */}
        <View style={styles.appointmentMainInfo}>
          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View style={styles.iconBox}>
                <Ionicons name="calendar-outline" size={16} color="#0891b2" />
              </View>
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
              >
                {new Date(item.appointmentDate).toLocaleString("vi-VN")}
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View style={styles.iconBox}>
                <Ionicons name="home-outline" size={16} color="#6b7280" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                  Phòng khám
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  {item.clinicName}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View style={styles.iconBox}>
                <Ionicons name="location-outline" size={16} color="#6b7280" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                  Địa chỉ
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  {item.clinicId.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View style={styles.iconBox}>
                <Ionicons name="person-outline" size={16} color="#ca0404" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>Bác sĩ</Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  {item.doctorId?.fullName || "Chưa có bác sĩ"}
                </Text>
              </View>
            </View>
          </View>

          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#ca8a04"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                  Lý do khám
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                >
                  {item.reason}
                </Text>
              </View>
            </View>
          </View>

          {item.status === "cancelled" ?
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <View style={styles.iconBox}>
                  <Ionicons
                    name="x"
                    size={16}
                    color="#ca0404ff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    Lý do từ chối
                  </Text>
                  <Text
                    style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}
                  >
                    {item.cancellationReason}
                  </Text>
                </View>
              </View>
            </View> : <></>}

          {item.notes && (
            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <View style={[styles.iconBox, { marginTop: 2 }]}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#0891b2"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    Ghi chú
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#111827", marginTop: 2 }}
                  >
                    {item.notes}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer: Thời gian tạo */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
            Tạo: {new Date(item.createdAt).toLocaleString("vi-VN")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Enhanced Header */}
      <View style={styles.enhancedHeader}>
        <Text style={styles.enhancedHeaderTitle}>Lịch khám của tôi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={24} color="#0891b2" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Tabs */}
      <View style={styles.enhancedTabs}>
        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "upcoming" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "upcoming" && styles.enhancedTabTextActive,
            ]}
          >
            Sắp tới
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "completed" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "completed" && styles.enhancedTabTextActive,
            ]}
          >
            Đã khám
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "cancelled" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "cancelled" && styles.enhancedTabTextActive,
            ]}
          >
            Đã hủy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "pending" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "pending" && styles.enhancedTabTextActive,
            ]}
          >
            Chờ duyệt
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0891b2" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
            <Text style={styles.emptyTitle}>{error}</Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={() => loadAppointments()}
            >
              <Text style={styles.emptyActionText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
              {activeTab === "upcoming"
                ? "Chưa có lịch khám"
                : "Chưa có lịch sử khám"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "upcoming"
                ? "Đặt lịch khám với bác sĩ ngay hôm nay"
                : "Các cuộc hẹn đã hoàn thành sẽ hiển thị ở đây"}
            </Text>
            {activeTab === "upcoming" && (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => setShowModal(true)}
              >
                <Text style={styles.emptyActionText}>Đặt lịch ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          appointments.map(renderAppointmentCard)
        )}
      </ScrollView>

      {/* Modal đặt lịch */}
      <CreateAppointmentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadAppointments}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  enhancedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#0891b2",
    borderEndEndRadius: 16,
    borderEndStartRadius: 16,
  },
  enhancedHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  enhancedTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  enhancedTabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  enhancedTabActive: {
    backgroundColor: "#0891b2",
  },
  enhancedTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  enhancedTabTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  emptyActionButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0891b2",
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fafbfc",
  },
  appointmentMainInfo: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fafbfc",
  },
});
