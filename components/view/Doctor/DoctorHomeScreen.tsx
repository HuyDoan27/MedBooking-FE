import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Video,
  FileText,
  Bell,
  Star,
  CheckCircle,
  ChevronRight,
} from "lucide-react-native";

const DoctorHomeScreen: React.FC = () => {
  const today = new Date();

  // Lấy thứ bằng tiếng Việt
  const weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const weekday = weekdays[today.getDay()];

  // Format dd/mm/yyyy
  const dateStr = today.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const doctorInfo = {
    name: "BS. Nguyễn Văn An",
    specialty: "Bác sĩ Nội khoa",
    avatar: require("../../../assets/images/favicon.png"),
  };

  const todayStats = [
    {
      label: "Lịch hẹn",
      value: "12",
      icon: Calendar,
      color: ["#06b6d4", "#3b82f6"],
      bg: "#ecfeff",
    },
    {
      label: "Đã khám",
      value: "5",
      icon: CheckCircle,
      color: ["#22c55e", "#10b981"],
      bg: "#f0fdf4",
    },
    {
      label: "Đang chờ",
      value: "4",
      icon: Clock,
      color: ["#f97316", "#f59e0b"],
      bg: "#fff7ed",
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      time: "09:00",
      patient: "Nguyễn Văn An",
      age: 45,
      reason: "Khám tổng quát",
      type: "in-person",
      avatar: require("../../../assets/images/favicon.png"),
    },
    {
      id: 2,
      time: "09:30",
      patient: "Trần Thị Bình",
      age: 32,
      reason: "Tái khám tim mạch",
      type: "video",
      avatar: require("../../../assets/images/favicon.png"),
    },
    {
      id: 3,
      time: "10:00",
      patient: "Lê Minh Cường",
      age: 28,
      reason: "Đau đầu, chóng mặt",
      type: "in-person",
      avatar: require("../../../assets/images/favicon.png"),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.doctorInfo}>
            <Image source={doctorInfo.avatar} style={styles.avatar} />
            <View>
              <Text style={styles.doctorName}>Xin chào, {doctorInfo.name}</Text>
              <Text style={styles.specialty}>{doctorInfo.specialty}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Bell size={24} color="#fff" />
            <View style={styles.redDot} />
          </TouchableOpacity>
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
          <View
            key={idx}
            style={[styles.statCard, { backgroundColor: stat.bg }]}
          >
            <stat.icon size={28} color={stat.color[0]} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Lịch sắp tới</Text>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ color: "#06b6d4", fontWeight: "600" }}>
              Xem tất cả
            </Text>
            <ChevronRight size={16} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {upcomingAppointments.map((item) => (
          <TouchableOpacity key={item.id} style={styles.appointmentItem}>
            <Image source={item.avatar} style={styles.patientAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>
                {item.patient}{" "}
                <Text style={styles.patientAge}>{item.age} tuổi</Text>
              </Text>
              <Text style={styles.reason}>{item.reason}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={16} color="#06b6d4" />
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
            <Text
              style={{ fontSize: 22, fontWeight: "bold", color: "#a855f7" }}
            >
              +12%
            </Text>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  doctorInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  doctorName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  specialty: { color: "#bae6fd", fontSize: 14 },
  bellButton: { padding: 8 },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    position: "absolute",
    top: 6,
    right: 6,
  },
  dateCard: {
    marginTop: 16,
    padding: 12,
    paddingHorizontal: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subText: { color: "#000000ff", fontSize: 14 },
  bigText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  rating: { color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 4 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    margin: 16,
    gap: 12,
    justifyContent: "space-between",
  },
  statCard: {
    flexBasis: "30%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#87898bff",
  },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#111" },
  statLabel: { fontSize: 14, color: "#555" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111",
  },
  quickGrid: { flexDirection: "row", justifyContent: "space-between" },
  quickButton: { alignItems: "center", flex: 1 },
  quickText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginTop: 6,
    textAlign: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    height: 100,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  patientAvatar: { width: 60, height: 60, borderRadius: 24, marginRight: 15 },
  patientName: { fontWeight: "700", color: "#111", marginBottom: 6 },
  patientAge: { fontSize: 12, color: "#666" },
  reason: { fontSize: 13, color: "#555" },
  time: { fontSize: 14, fontWeight: "600", color: "#06b6d4", marginLeft: 4 },
});

export default DoctorHomeScreen;
