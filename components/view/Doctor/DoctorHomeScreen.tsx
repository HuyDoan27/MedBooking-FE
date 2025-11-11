import { getTodayAppointmentsByDoctor, getAppointmentStatusCount } from "@/services/AppointmentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DoctorHomeScreen: React.FC = () => {
  const [doctorName, setDoctorName] = useState("Bác sĩ");
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ completed: 0, pending: 0 });

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) {
          console.warn("Không tìm thấy user trong storage");
          return;
        }

        const user = JSON.parse(userData);
        const doctorId = user._id || user.id;
        setDoctorName(user.fullName || "Bác sĩ");

        // 🔹 Lấy lịch hẹn hôm nay
        const response = await getTodayAppointmentsByDoctor(doctorId);
        if (response.data.success) {
          setTodayAppointments(response.data.data);
        }

        // 🔹 Lấy thống kê trạng thái theo bác sĩ hiện tại
        const statusRes = await getAppointmentStatusCount();
        if (statusRes.data.success) {
          setStatusCounts(statusRes.data.data);
        }
      } catch (e) {
        console.warn("Lỗi khi tải dữ liệu:", e);
      }
    })();
  }, []);


  const today = new Date();
  const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const weekday = weekdays[today.getDay()];
  const dateStr = today.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const todayStats = [
    {
      label: "Lịch hẹn",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      color: "#06b6d4",
      bg: "#ecfeff",
    },
    {
      label: "Đã khám",
      value: statusCounts.completed.toString(),
      icon: CheckCircle,
      color: "#22c55e",
      bg: "#f0fdf4",
    },
    {
      label: "Đang chờ",
      value: statusCounts.pending.toString(),
      icon: Clock,
      color: "#f97316",
      bg: "#fff7ed",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.doctorInfo}>
            <Image
              source={{
                uri:
                  `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.doctorName}>Xin chào, Bs. {doctorName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dateCard}>
          <View>
            <Text style={styles.subText}>Hôm nay</Text>
            <Text style={styles.bigText}>{`${weekday}, ${dateStr}`}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.subText}>Đánh giá trung bình</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Star size={18} color="#facc15" fill="#facc15" />
              <Text style={styles.rating}>4.8</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {todayStats.map((stat, idx) => (
          <View key={idx} style={[styles.statCard, { backgroundColor: stat.bg }]}>
            <stat.icon size={28} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Lịch khám ngày hôm nay</Text>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "#06b6d4", fontWeight: "600" }}>Xem tất cả</Text>
            <ChevronRight size={16} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {todayAppointments.length === 0 ? (
          <Text>Không có lịch hẹn hôm nay</Text>
        ) : (
          todayAppointments.map((item) => (
            <TouchableOpacity key={item._id} style={styles.appointmentItem}>
              <Image source={require("../../../assets/images/favicon.png")} style={styles.patientAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>
                  {item.userId?.fullName || "Bệnh nhân"}
                </Text>
                <Text style={styles.reason}>{item.reason || item.appointmentType || "Chưa có lý do"}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Clock size={16} color="#06b6d4" />
                <Text style={styles.time}>
                  {new Date(item.appointmentDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Performance */}
      <View style={[styles.card, { backgroundColor: "#faf5ff" }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TrendingUp size={40} color="#a855f7" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.cardTitle}>Hiệu suất tuần này</Text>
            <Text style={styles.reason}>Bạn đã khám 45 bệnh nhân</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#a855f7" }}>+12%</Text>
            <Text style={styles.subText}>so với tuần trước</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  header: {
    backgroundColor: "#0891b2",
    padding: 16,
    paddingBottom: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  doctorInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  doctorName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  specialty: { color: "#bae6fd", fontSize: 14 },
  bellButton: { padding: 8 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "red", position: "absolute", top: 6, right: 6 },
  dateCard: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subText: { color: "#000000aa", fontSize: 14 },
  bigText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  rating: { color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 4 },
  statsGrid: { flexDirection: "row", margin: 16, gap: 12, justifyContent: "space-between" },
  statCard: { flexBasis: "30%", padding: 16, borderRadius: 16, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#111", marginTop: 4 },
  statLabel: { fontSize: 14, color: "#555", marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#111" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    height: 90,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  patientAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  patientName: { fontWeight: "700", color: "#111" },
  patientAge: { fontSize: 12, color: "#666" },
  reason: { fontSize: 13, color: "#555", marginTop: 2 },
  time: { fontSize: 14, fontWeight: "600", color: "#06b6d4", marginLeft: 4 },
});

export default DoctorHomeScreen;
