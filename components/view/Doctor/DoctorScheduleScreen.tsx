import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAppointmentsByDoctor } from "@/services/AppointmentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // import tiếng Việt

dayjs.locale("vi"); // set locale tiếng Việt

type Appointment = {
  id: string;
  time: string;
  patient: string;
  age: number;
  phone: string;
  reason: string;
  type?: "in-person" | "video";
  status: "confirmed" | "waiting" | "completed" | "cancelled";
  avatar?: string;
};

// định nghĩa status UI config
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
      }));

      setAppointments(mapped);
    } catch (err) {
      console.error("fetch appointments error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, search, date]);

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    waiting: appointments.filter((a) => a.status === "waiting").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  const filteredAppointments =
    filterStatus === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === filterStatus);

  const renderItem = ({ item }: { item: Appointment }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={styles.card}>
        <View
          style={[styles.cardBorder, { backgroundColor: statusConfig.color }]}
        />

        {/* Time Badge */}
        <View style={styles.timeBadge}>
          <View style={styles.timeIconContainer}>
            <Feather name="clock" size={14} color="#0891b2" />
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.cardContent}>
          {/* Avatar Section */}
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

          {/* Info Section */}
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
      </View>
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

  const today = dayjs().format("dddd, DD [Tháng] MM, YYYY");

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Search */}
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
          <FilterTab
            label="Sắp tới"
            value="upcoming"
            icon="grid"
          />

          <FilterTab
            label="Đã khám xong"
            value="completed"
            icon="check"
          />
          <FilterTab
            label="Chờ duyệt lịch khám"
            value="pending"
            icon="clock"
          />
          <FilterTab
            label="Từ chối lịch khám"
            value="cancelled"
            icon="x-circle"
          />
        </ScrollView>
      </View>

      {/* List */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  header: {
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: "#cffafe",
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  statsContainer: {
    marginTop: -35,
    marginBottom: 8,
  },
  statsContent: {
    paddingHorizontal: 16,
  },
  statCard: {
    width: 110,
    height: 120,
    borderRadius: 20,
    padding: 14,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1e293b",
  },

  filterContainer: {
    paddingVertical: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "white",
    marginRight: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTabActive: {
    backgroundColor: "#ecfeff",
    borderWidth: 2,
    borderColor: "#0891b2",
    elevation: 3,
  },
  filterTabText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#0891b2",
    fontWeight: "700",
  },
  countBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 24,
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: "#0891b2",
  },
  countText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
  },
  countTextActive: {
    color: "white",
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    overflow: "hidden",
  },
  cardBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },

  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ecfeff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
  },
  timeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0891b2",
  },

  cardContent: {
    flexDirection: "row",
  },

  avatarSection: {
    position: "relative",
    marginRight: 14,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 37,
    borderWidth: 3,
  },
  videoIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 6,
    borderWidth: 3,
    borderColor: "white",
    elevation: 2,
  },

  infoSection: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  patientName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },

  detailsRow: {
    flexDirection: "row",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  detailIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ecfeff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },

  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f9ff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  reasonText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#0c4a6e",
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryBtn: {
    elevation: 2,
  },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    paddingHorizontal: 16,
    width: "100%",
  },
  secondaryBtn: {
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#cffafe",
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: "#d1fae5",
    backgroundColor: "#f0fdf4",
  },
  btnText: {
    color: "white",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
  },
  btnSecondaryText: {
    color: "#0891b2",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
  },
  btnOutlineText: {
    color: "#10b981",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
});
