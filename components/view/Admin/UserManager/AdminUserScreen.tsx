import { getUsersWithAppointments } from "@/services/UserService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import UserCard from "./UserCard";
import UserDetailModal from "./UserDetailModal";
import { LinearGradient } from "expo-linear-gradient";

const Icon = ({ name, size = 16, color = "#64748b" }) => {
  const icons = {
    search: "🔍",
    plus: "➕",
  };
  return <Text style={{ fontSize: size, color }}>{icons[name] || "•"}</Text>;
};

export default function AdminUsersScreen() {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsersWithAppointments();
        if (res.data.success) setUsers(res.data.data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Lọc theo text tìm kiếm
  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0891b2", "#06b6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
          <Text style={styles.headerSubtitle}>
            Quản lý tất cả người dùng trong hệ thống
          </Text>
          <View style={styles.searchContainer}>
            <Icon name="search" size={16} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm người dùng..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {filteredUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onPressDetail={() => setSelectedUser(user)}
            />
          ))}
        </ScrollView>
      )}

      {/* Modal chi tiết */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingTop: 40,
    borderEndEndRadius: 16,
    borderEndStartRadius: 16,
  },
  headerContent: { padding: 16, paddingBottom: 20 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#ccd9ecff",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0f172a",
  },
  content: { padding: 16 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
