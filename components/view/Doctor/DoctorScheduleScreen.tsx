import {
  getAppointmentsByDoctor,
  updateAppointmentStatus,
} from "@/services/AppointmentService";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";

import "dayjs/locale/vi";

dayjs.locale("vi");

type Appointment = {
  id: string;
  time: string;
  patient: string;
  age: number;
  phone: string;
  reason: string;
  type?: "in-person" | "video";
  status: "confirmed" | "completed" | "cancelled" | "pending" | "upcoming";
  avatar?: string;
  appointmentDate?: string;
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "upcoming":
      return {
        color: "#0891b2",
        bg: "#e0f2fe",
        icon: "check-circle",
        label: "Đã xác nhận",
      };
    case "pending":
      return {
        color: "#f59e0b",
        bg: "#fef3c7",
        icon: "clock",
        label: "Đang chờ",
      };
    case "completed":
      return {
        color: "#10b981",
        bg: "#d1fae5",
        icon: "check",
        label: "Hoàn thành",
      };
    case "cancelled":
      return {
        color: "#ef4444",
        bg: "#fee2e2",
        icon: "x-circle",
        label: "Đã hủy",
      };
    default:
      return {
        color: "#94a3b8",
        bg: "#f1f5f9",
        icon: "info",
        label: "Khác",
      };
  }
};

export default function DoctorScheduleScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // State cho modal từ chối
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const userId = user._id;
      if (!userId) return;

      const res = await getAppointmentsByDoctor(userId, {
        date,
        status: filterStatus === "all" ? "" : filterStatus,
        patientName: search,
      });

      const mapped: Appointment[] = res.data.data.map((item: any) => ({
        id: item._id,
        time: new Date(item.appointmentDate).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        patient: item.userId.fullName,
        phone: item.userId.phoneNumber || "Chưa có",
        reason: item.reason,
        status: item.status,
        age: 30,
        type: item.type || "in-person",
        avatar: item.userId.avatar || undefined,
        appointmentDate: item.appointmentDate,
      }));

      setAppointments(mapped);
    } catch (err) {
      console.error("fetch appointments error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, search, date]);

  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: string,
    cancellationReason?: string
  ) => {
    try {
      Toast.show({ type: "info", text1: "Đang xử lý...", position: "top" });

      const payload: any = { status: newStatus };
      
      // Nếu từ chối, thêm lý do
      if (newStatus === "cancelled" && cancellationReason) {
        payload.reason  = cancellationReason;
      }

      const res = await updateAppointmentStatus(appointmentId, payload);
      console.log("✅ Kết quả:", res.data);
      await fetchData();

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2:
          newStatus === "upcoming"
            ? "Lịch hẹn đã được duyệt"
            : newStatus === "cancelled"
            ? "Lịch hẹn đã bị từ chối"
            : newStatus === "completed"
            ? "Đã đánh dấu hoàn thành"
            : "Trạng thái đã được cập nhật",
        position: "bottom",
      });
    } catch (err) {
      console.error("❌ update status error:", err);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật trạng thái, vui lòng thử lại.",
        position: "bottom",
      });
    }
  };

  const confirmAction = (
    appointmentId: string,
    newStatus: string,
    message: string
  ) => {
    console.log("confirmAction chạy với:", appointmentId, newStatus);
    
    // Nếu là từ chối, hiển thị modal nhập lý do
    if (newStatus === "cancelled") {
      setPendingRejectId(appointmentId);
      setRejectReason("");
      setRejectModalVisible(true);
      return;
    }
    
    // Các trạng thái khác: duyệt hoặc hoàn thành
    Alert.alert(
      "Xác nhận",
      message,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: () => handleUpdateStatus(appointmentId, newStatus),
        },
      ],
      { cancelable: true }
    );
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập lý do từ chối",
        position: "top",
      });
      return;
    }

    if (pendingRejectId) {
      setRejectModalVisible(false);
      handleUpdateStatus(pendingRejectId, "cancelled", rejectReason.trim());
      setPendingRejectId(null);
      setRejectReason("");
    }
  };

  const filteredAppointments =
    filterStatus === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === filterStatus);

  const renderActionButtons = (item: Appointment) => {
    if (item.status === "pending") {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() =>
              confirmAction(
                item.id,
                "upcoming",
                "Xác nhận duyệt lịch khám này?"
              )
            }
            activeOpacity={0.7}
          >
            <Feather name="check" size={14} color="white" />
            <Text style={styles.actionBtnText}>Duyệt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() =>
              confirmAction(item.id, "cancelled", "Từ chối lịch khám này?")
            }
            activeOpacity={0.7}
          >
            <Feather name="x" size={14} color="white" />
            <Text style={styles.actionBtnText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.status === "upcoming") {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() =>
              confirmAction(item.id, "completed", "Xác nhận đã khám xong?")
            }
            activeOpacity={0.7}
          >
            <Feather name="check-circle" size={14} color="white" />
            <Text style={styles.actionBtnText}>Hoàn thành</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedAppointment(item);
          setModalVisible(true);
        }}
        activeOpacity={0.9}
      >
        <View
          style={[styles.cardBorder, { backgroundColor: statusConfig.color }]}
        />

        <View style={styles.topSection}>
          <View style={styles.timeBadge}>
            <View style={styles.timeIconContainer}>
              <Feather name="clock" size={14} color="#0891b2" />
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          {renderActionButtons(item)}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    item.avatar ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(item.patient),
                }}
                style={styles.avatar}
              />
              <View
                style={[styles.avatarRing, { borderColor: statusConfig.color }]}
              />
            </View>
            {item.type === "video" && (
              <View style={styles.videoIcon}>
                <Feather name="video" size={12} color="white" />
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={styles.patientName} numberOfLines={1}>
                {item.patient}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bg },
                ]}
              >
                <Feather
                  name={statusConfig.icon as any}
                  size={11}
                  color={statusConfig.color}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconBg}>
                  <Feather name="user" size={12} color="#0891b2" />
                </View>
                <Text style={styles.detailText}>{item.age} tuổi</Text>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.detailIconBg}>
                  <Feather name="phone" size={12} color="#0891b2" />
                </View>
                <Text style={styles.detailText}>{item.phone}</Text>
              </View>
            </View>

            <View style={styles.reasonRow}>
              <Feather name="file-text" size={14} color="#0891b2" />
              <Text style={styles.reasonText} numberOfLines={2}>
                {item.reason}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterTab = ({ label, value, icon }: any) => {
    const isActive = filterStatus === value;
    return (
      <TouchableOpacity
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => setFilterStatus(value)}
        activeOpacity={0.7}
      >
        <Feather
          name={icon}
          size={16}
          color={isActive ? "#0891b2" : "#64748b"}
        />
        <Text
          style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather name="calendar" size={48} color="#cbd5e1" />
      </View>
      <Text style={styles.emptyTitle}>Không có lịch hẹn</Text>
      <Text style={styles.emptySubtitle}>
        Không tìm thấy lịch hẹn nào phù hợp với bộ lọc đã chọn
      </Text>
    </View>
  );

  const RejectReasonModal = () => (
    <Modal
      visible={rejectModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setRejectModalVisible(false)}
    >
      <View style={styles.rejectModalOverlay}>
        <View style={styles.rejectModalContent}>
          <View style={styles.rejectModalHeader}>
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.rejectModalTitle}>Lý do từ chối</Text>
          </View>

          <Text style={styles.rejectModalSubtitle}>
            Vui lòng nhập lý do từ chối lịch khám này
          </Text>

          <TextInput
            style={styles.rejectReasonInput}
            placeholder="Nhập lý do từ chối..."
            placeholderTextColor="#94a3b8"
            value={rejectReason}
            onChangeText={setRejectReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.rejectModalActions}>
            <TouchableOpacity
              style={[styles.rejectModalBtn, styles.rejectModalCancelBtn]}
              onPress={() => {
                setRejectModalVisible(false);
                setRejectReason("");
                setPendingRejectId(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.rejectModalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectModalBtn, styles.rejectModalSubmitBtn]}
              onPress={handleRejectSubmit}
              activeOpacity={0.7}
            >
              <Text style={styles.rejectModalSubmitText}>Xác nhận từ chối</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const DetailModal = () => {
    if (!selectedAppointment) return null;
    const statusConfig = getStatusConfig(selectedAppointment.status);

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết lịch khám</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <View style={styles.modalAvatarContainer}>
                  <Image
                    source={{
                      uri:
                        selectedAppointment.avatar ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(selectedAppointment.patient),
                    }}
                    style={styles.modalAvatar}
                  />
                  {selectedAppointment.type === "video" && (
                    <View style={styles.modalVideoIcon}>
                      <Feather name="video" size={16} color="white" />
                    </View>
                  )}
                </View>
                <Text style={styles.modalPatientName}>
                  {selectedAppointment.patient}
                </Text>
                <View
                  style={[
                    styles.modalStatusBadge,
                    { backgroundColor: statusConfig.bg },
                  ]}
                >
                  <Feather
                    name={statusConfig.icon as any}
                    size={14}
                    color={statusConfig.color}
                  />
                  <Text
                    style={[
                      styles.modalStatusText,
                      { color: statusConfig.color },
                    ]}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailIcon}>
                    <Feather name="clock" size={18} color="#0891b2" />
                  </View>
                  <View style={styles.modalDetailContent}>
                    <Text style={styles.modalDetailLabel}>Thời gian</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedAppointment.time} -{" "}
                      {dayjs(selectedAppointment.appointmentDate).format(
                        "DD/MM/YYYY"
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailIcon}>
                    <Feather name="user" size={18} color="#0891b2" />
                  </View>
                  <View style={styles.modalDetailContent}>
                    <Text style={styles.modalDetailLabel}>Tuổi</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedAppointment.age} tuổi
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailIcon}>
                    <Feather name="phone" size={18} color="#0891b2" />
                  </View>
                  <View style={styles.modalDetailContent}>
                    <Text style={styles.modalDetailLabel}>Số điện thoại</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedAppointment.phone}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailIcon}>
                    <Feather name="file-text" size={18} color="#0891b2" />
                  </View>
                  <View style={styles.modalDetailContent}>
                    <Text style={styles.modalDetailLabel}>Lý do khám</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedAppointment.reason}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailIcon}>
                    <Feather
                      name={
                        selectedAppointment.type === "video" ? "video" : "users"
                      }
                      size={18}
                      color="#0891b2"
                    />
                  </View>
                  <View style={styles.modalDetailContent}>
                    <Text style={styles.modalDetailLabel}>Hình thức</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedAppointment.type === "video"
                        ? "Khám qua video"
                        : "Khám trực tiếp"}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedAppointment.status === "pending" && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.approveBtn]}
                    onPress={() => {
                      setModalVisible(false);
                      confirmAction(
                        selectedAppointment.id,
                        "upcoming",
                        "Xác nhận duyệt lịch khám này?"
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="check" size={18} color="white" />
                    <Text style={styles.modalActionBtnText}>
                      Duyệt lịch khám
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.rejectBtn]}
                    onPress={() => {
                      setModalVisible(false);
                      confirmAction(
                        selectedAppointment.id,
                        "cancelled",
                        "Từ chối lịch khám này?"
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={18} color="white" />
                    <Text style={styles.modalActionBtnText}>Từ chối</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedAppointment.status === "upcoming" && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.completeBtn]}
                    onPress={() => {
                      setModalVisible(false);
                      confirmAction(
                        selectedAppointment.id,
                        "completed",
                        "Xác nhận đã khám xong?"
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="check-circle" size={18} color="white" />
                    <Text style={styles.modalActionBtnText}>
                      Hoàn thành khám
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const today = dayjs().format("dddd, DD [Tháng] MM, YYYY");

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0891b2", "#06b6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerTitle}>Lịch khám bệnh</Text>
          <Text style={styles.headerSubtitle}>{today}</Text>
        </View>
        <TouchableOpacity style={styles.calendarBtn} activeOpacity={0.8}>
          <Feather name="calendar" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#94a3b8" />
        <TextInput
          placeholder="Tìm kiếm bệnh nhân..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View>
        <ScrollView
          horizontal
          style={styles.filterContainer}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          <FilterTab label="Sắp tới" value="upcoming" icon="grid" />
          <FilterTab label="Đã khám xong" value="completed" icon="check" />
          <FilterTab label="Chờ duyệt lịch khám" value="pending" icon="clock" />
          <FilterTab
            label="Từ chối lịch khám"
            value="cancelled"
            icon="x-circle"
          />
        </ScrollView>
      </View>

      {filteredAppointments.length > 0 ? (
        <FlatList
          data={filteredAppointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}

      <DetailModal />
      <RejectReasonModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1e293b",
  },
  filterContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: "#e0f2fe",
  },
  filterTabText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: "#0891b2",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0891b2",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  approveBtn: {
    backgroundColor: "#10b981",
  },
  rejectBtn: {
    backgroundColor: "#ef4444",
  },
  completeBtn: {
    backgroundColor: "#0891b2",
  },
  actionBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatarSection: {
    position: "relative",
    marginRight: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 2,
  },
  videoIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0891b2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  infoSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  patientName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    color: "#64748b",
  },
  reasonRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeBtn: {
    padding: 4,
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalAvatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 16,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalVideoIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0891b2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  modalPatientName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 12,
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalDetailContent: {
    flex: 1,
  },
  modalDetailLabel: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  modalActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalActionBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Reject Reason Modal Styles
  rejectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  rejectModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  rejectModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  rejectModalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  rejectReasonInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 120,
    backgroundColor: "#f8fafc",
  },
  rejectModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  rejectModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectModalCancelBtn: {
    backgroundColor: "#f1f5f9",
  },
  rejectModalSubmitBtn: {
    backgroundColor: "#ef4444",
  },
  rejectModalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  rejectModalSubmitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
});