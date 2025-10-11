import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StatCard = {
  label: string;
  value: string;
  change: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
};

type RevenueCard = {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
};

type Activity = {
  action: string;
  name: string;
  time: string;
  type: "clinic" | "doctor" | "user" | "appointment" | "payment";
};

type Clinic = {
  name: string;
  appointments: number;
  revenue: string;
  rating: number;
};

export default function AdminDashboardScreen() {
  const stats: StatCard[] = [
    {
      label: "Tổng người dùng",
      value: "12,458",
      change: "+12%",
      icon: "users",
      color: "#3b82f6",
    },
    {
      label: "Phòng khám",
      value: "156",
      change: "+8%",
      icon: "home",
      color: "#10b981",
    },
    {
      label: "Bác sĩ",
      value: "892",
      change: "+15%",
      icon: "activity",
      color: "#a855f7",
    },
    {
      label: "Lịch hẹn hôm nay",
      value: "1,234",
      change: "+23%",
      icon: "calendar",
      color: "#f97316",
    },
  ];

  const revenueStats: RevenueCard[] = [
    { label: "Doanh thu tháng này", value: "2.4 tỷ VNĐ", icon: "dollar-sign" },
    { label: "Tăng trưởng", value: "+18.5%", icon: "trending-up" },
    { label: "Lượt khám", value: "45,678", icon: "activity" },
    { label: "Thời gian TB", value: "28 phút", icon: "clock" },
  ];

  const recentActivities: Activity[] = [
    {
      action: "Phòng khám mới đăng ký",
      name: "Phòng khám Đa khoa Hòa Bình",
      time: "5 phút trước",
      type: "clinic",
    },
    {
      action: "Bác sĩ mới tham gia",
      name: "BS. Nguyễn Văn An",
      time: "15 phút trước",
      type: "doctor",
    },
    {
      action: "Người dùng mới",
      name: "Trần Thị Bình",
      time: "30 phút trước",
      type: "user",
    },
    {
      action: "Lịch hẹn được tạo",
      name: "Khám tim mạch",
      time: "1 giờ trước",
      type: "appointment",
    },
    {
      action: "Thanh toán hoàn tất",
      name: "500,000 VNĐ",
      time: "2 giờ trước",
      type: "payment",
    },
  ];

  const topClinics: Clinic[] = [
    {
      name: "Phòng khám Đa khoa Quốc tế",
      appointments: 1234,
      revenue: "450M",
      rating: 4.9,
    },
    {
      name: "Bệnh viện Đại học Y",
      appointments: 1089,
      revenue: "420M",
      rating: 4.8,
    },
    {
      name: "Phòng khám Tim mạch Hà Nội",
      appointments: 892,
      revenue: "380M",
      rating: 4.7,
    },
    {
      name: "Phòng khám Nhi đồng",
      appointments: 756,
      revenue: "320M",
      rating: 4.8,
    },
  ];

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "clinic":
        return "#10b981";
      case "doctor":
        return "#a855f7";
      case "user":
        return "#3b82f6";
      case "appointment":
        return "#f97316";
      case "payment":
        return "#0891b2";
      default:
        return "#94a3b8";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Dashboard Quản trị</Text>
              <Text style={styles.headerSubtitle}>Chào mừng trở lại, Admin</Text>
            </View>
            <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
              <Text style={styles.exportButtonText}>Xuất báo cáo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statLeft}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statChange}>{stat.change}</Text>
                </View>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Feather name={stat.icon} size={20} color="white" />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Revenue Stats */}
        <LinearGradient
          colors={["#0891b2", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.revenueCard}
        >
          <Text style={styles.revenueTitle}>Thống kê doanh thu</Text>
          <View style={styles.revenueGrid}>
            {revenueStats.map((stat, index) => (
              <View key={index} style={styles.revenueItem}>
                <View style={styles.revenueItemHeader}>
                  <Feather name={stat.icon} size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.revenueLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.revenueValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Top Clinics */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phòng khám hàng đầu</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.clinicsList}>
            {topClinics.map((clinic, index) => (
              <View key={index} style={styles.clinicItem}>
                <LinearGradient
                  colors={["#0891b2", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.clinicRank}
                >
                  <Text style={styles.clinicRankText}>{index + 1}</Text>
                </LinearGradient>
                <View style={styles.clinicInfo}>
                  <Text style={styles.clinicName} numberOfLines={1}>
                    {clinic.name}
                  </Text>
                  <View style={styles.clinicStats}>
                    <Text style={styles.clinicStatText}>
                      {clinic.appointments} lịch
                    </Text>
                    <Text style={styles.clinicRevenue}>{clinic.revenue}</Text>
                    <View style={styles.clinicRating}>
                      <Feather name="star" size={12} color="#f59e0b" />
                      <Text style={styles.clinicRatingText}>
                        {clinic.rating}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <View style={styles.activitiesList}>
            {recentActivities.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityItem,
                  index !== recentActivities.length - 1 && styles.activityBorder,
                ]}
              >
                <View
                  style={[
                    styles.activityDot,
                    { backgroundColor: getActivityColor(activity.type) },
                  ]}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 50,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  exportButton: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  statCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statLeft: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  statChange: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
    marginTop: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  revenueCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  revenueTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  revenueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  revenueItem: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
  },
  revenueItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  revenueLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  sectionLink: {
    fontSize: 14,
    color: "#0891b2",
    fontWeight: "500",
  },
  clinicsList: {
    gap: 12,
  },
  clinicItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  clinicRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicRankText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  clinicStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clinicStatText: {
    fontSize: 12,
    color: "#64748b",
  },
  clinicRevenue: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  clinicRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clinicRatingText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 12,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 2,
  },
  activityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#64748b",
  },
});