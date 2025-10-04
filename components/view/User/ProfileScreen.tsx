import React, { useState } from "react"
import {
  View,
  Text,
  Image,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  MapPin,
  Bell,
  Shield,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  Edit,
  Camera,
  ChevronRight,
} from "lucide-react-native"

const userProfile = {
  name: "Đoàn Quang Huy",
  email: "doanhuy2004@gmail.com",
  phone: "0987 599 814",
  dateOfBirth: "27/01/2004",
  address: "Nam Minh, Ninh Bình 2",
  avatar: "https://i.pravatar.cc/150?img=32", 
  memberSince: "Tháng 6, 2023",
  totalAppointments: 12,
  upcomingAppointments: 2,
}

const menuItems = [
  {
    icon: Heart,
    title: "Hồ sơ sức khỏe",
    subtitle: "Lịch sử khám bệnh, đơn thuốc",
    color: "#dc2626",
    bgColor: "#fee2e2",
  },
  {
    icon: CreditCard,
    title: "Thanh toán & Bảo hiểm",
    subtitle: "Phương thức thanh toán, bảo hiểm y tế",
    color: "#2563eb",
    bgColor: "#dbeafe",
  },
  {
    icon: Bell,
    title: "Thông báo",
    subtitle: "Nhắc nhở lịch khám, kết quả xét nghiệm",
    color: "#ea580c",
    bgColor: "#ffedd5",
  },
  {
    icon: Shield,
    title: "Bảo mật & Quyền riêng tư",
    subtitle: "Mật khẩu, xác thực 2 bước",
    color: "#16a34a",
    bgColor: "#dcfce7",
  },
  {
    icon: Settings,
    title: "Cài đặt",
    subtitle: "Ngôn ngữ, giao diện, đồng bộ",
    color: "#374151",
    bgColor: "#f3f4f6",
  },
]

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: userProfile.avatar }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.memberSince}>
                Thành viên từ {userProfile.memberSince}
              </Text>

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {userProfile.totalAppointments}
                  </Text>
                  <Text style={styles.statLabel}>Lượt khám</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {userProfile.upcomingAppointments}
                  </Text>
                  <Text style={styles.statLabel}>Sắp tới</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity style={styles.editButton}>
              <Edit size={16} color="#2563eb" />
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          {[
            { icon: User, label: "Họ và tên", value: userProfile.name, color: "#2563eb", bg: "#dbeafe" },
            { icon: Phone, label: "Số điện thoại", value: userProfile.phone, color: "#16a34a", bg: "#dcfce7" },
            { icon: Mail, label: "Email", value: userProfile.email, color: "#9333ea", bg: "#f3e8ff" },
            { icon: CalendarIcon, label: "Ngày sinh", value: userProfile.dateOfBirth, color: "#ea580c", bg: "#ffedd5" },
            { icon: MapPin, label: "Địa chỉ", value: userProfile.address, color: "#dc2626", bg: "#fee2e2" },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <View key={idx} style={styles.infoRow}>
                <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>
                  <Icon size={20} color={item.color} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Quick Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cài đặt nhanh</Text>
          <View style={styles.infoRow}>
            <View style={[styles.iconWrapper, { backgroundColor: "#dbeafe" }]}>
              <Bell size={20} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoValue}>Thông báo push</Text>
              <Text style={styles.infoLabel}>
                Nhận thông báo về lịch khám
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
        </View>

        {/* Menu Items */}
        {menuItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <TouchableOpacity key={idx} style={styles.menuItem}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: item.bgColor },
                ]}
              >
                <Icon size={24} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          )
        })}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutCard}>
          <LogOut size={20} color="#dc2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2563eb",
    padding: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  iconButton: {
    padding: 4,
  },
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563eb",
    borderRadius: 16,
    padding: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  memberSince: {
    fontSize: 12,
    color: "#bfdbfe",
  },
  statBox: {
    marginRight: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "#bfdbfe",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editText: {
    marginLeft: 4,
    color: "#2563eb",
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    marginTop: 8,
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
})
