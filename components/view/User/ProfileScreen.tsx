import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Bell,
  Edit,
  Camera,
  ChevronRight,
  LogOut,
  Heart,
  CreditCard,
  Shield,
  Settings,
  Award,
  Activity,
  Clock,
  Star,
} from "lucide-react-native";
import { getMe } from "../../../services/UserService";

const menuItems = [
  {
    icon: Heart,
    title: "Hồ sơ sức khỏe",
    subtitle: "Lịch sử khám bệnh, đơn thuốc",
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
  {
    icon: CreditCard,
    title: "Thanh toán & Bảo hiểm",
    subtitle: "Phương thức thanh toán, bảo hiểm y tế",
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  {
    icon: Bell,
    title: "Thông báo",
    subtitle: "Nhắc nhở lịch khám, kết quả xét nghiệm",
    color: "#f97316",
    bgColor: "#ffedd5",
  },
  {
    icon: Shield,
    title: "Bảo mật & Quyền riêng tư",
    subtitle: "Mật khẩu, xác thực 2 bước",
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  {
    icon: Settings,
    title: "Cài đặt",
    subtitle: "Ngôn ngữ, giao diện, đồng bộ",
    color: "#6366f1",
    bgColor: "#e0e7ff",
  },
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      setUser(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [220, 90],
    extrapolate: "clamp",
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.5],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Activity size={32} color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>
          Không tìm thấy thông tin người dùng
        </Text>
      </View>
    );
  }

  const isDoctor = user.role === "doctor";

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={[styles.profileSection]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user.avatar || "https://i.pravatar.cc/150?img=32",
              }}
              style={styles.avatar}
            />
            <View style={styles.avatarBadge}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
            </View>
          </View>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userRole}>
            {isDoctor ? "🩺 Bác sĩ" : "👤 Bệnh nhân"}
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Stats Cards - Chỉ hiển thị cho bác sĩ */}
        {isDoctor && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: "#dbeafe" }]}>
              <View style={styles.statIconWrapper}>
                <Activity size={22} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>248</Text>
              <Text style={styles.statLabel}>Bệnh nhân</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#d1fae5" }]}>
              <View style={styles.statIconWrapper}>
                <Award size={22} color="#10b981" />
              </View>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#fef3c7" }]}>
              <View style={styles.statIconWrapper}>
                <Clock size={22} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{user.experience || "5+"}</Text>
              <Text style={styles.statLabel}>Năm KN</Text>
            </View>
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity style={styles.editButton}>
              <Edit size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {[
              {
                icon: User,
                label: "Họ và tên",
                value: user.fullName,
                color: "#3b82f6",
                bg: "#dbeafe",
              },
              {
                icon: Phone,
                label: "Số điện thoại",
                value: user.phoneNumber,
                color: "#10b981",
                bg: "#d1fae5",
              },
              {
                icon: Mail,
                label: "Email",
                value: user.email,
                color: "#8b5cf6",
                bg: "#ede9fe",
              },
              ...(isDoctor
                ? [
                    {
                      icon: Award,
                      label: "Chuyên khoa",
                      value: user.specialty?.name || "Chưa cập nhật",
                      color: "#f59e0b",
                      bg: "#fef3c7",
                    },
                    {
                      icon: Activity,
                      label: "Phòng khám",
                      value: user.clinic?.name || "Chưa cập nhật",
                      color: "#06b6d4",
                      bg: "#cffafe",
                    },
                    {
                      icon: Clock,
                      label: "Kinh nghiệm",
                      value: user.experience || "Chưa cập nhật",
                      color: "#f97316",
                      bg: "#ffedd5",
                    },
                  ]
                : []),
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <View
                  key={idx}
                  style={[styles.infoRow, idx !== 0 && styles.infoRowBorder]}
                >
                  <View
                    style={[styles.iconWrapper, { backgroundColor: item.bg }]}
                  >
                    <Icon size={20} color={item.color} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cài đặt nhanh</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View
                style={[styles.iconWrapper, { backgroundColor: "#dbeafe" }]}
              >
                <Bell size={20} color="#3b82f6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoValue}>Thông báo push</Text>
                <Text style={styles.infoLabel}>
                  Nhận thông báo về lịch khám
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor={notificationsEnabled ? "#3b82f6" : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconWrapper,
                    { backgroundColor: item.bgColor },
                  ]}
                >
                  <Icon size={22} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  header: {
    backgroundColor: "rgba(8, 145, 178, 1.00)",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  profileSection: {
    alignItems: "center",
    paddingBottom: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "white",
  },
  avatarBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#bfdbfe",
    fontWeight: "500",
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrapper: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 2,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 15,
  },
  footer: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    color: "#cbd5e1",
    fontWeight: "500",
  },
});
