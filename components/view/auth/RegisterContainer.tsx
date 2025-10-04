import { Heart } from "lucide-react-native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const RegisterContainer: React.FC = ({ onSwitchToLogin }: any) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Heart size={40} color="#fff" />
        </View>
        <Text style={styles.title}>MedBooking</Text>
      </View>
      {/* Header */}
      <Text style={styles.title}>Đăng ký tài khoản</Text>
      <Text style={styles.subtitle}>Chọn loại đăng ký phù hợp với bạn</Text>

      {/* Switch button */}
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchButton]}
          onPress={() => router.push("/register-user")}
        >
          <Text style={styles.switchText}>Người dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchButton]}
          onPress={() => router.push("/register-doctor")}
        >
          <Text style={styles.switchText}>Bác sĩ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signup}>
        <Text style={{ color: "#4b5563" }}>
          Đã có tài khoản?{" "}
          <Text style={styles.link} onPress={onSwitchToLogin}>
            Đăng nhập ngay
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default RegisterContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff",
    padding: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#0891b2",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: 30,
  },
  switchButton: {
    width: 500,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: "#2563eb",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  activeButton: {
    backgroundColor: "#2563eb",
  },
  switchText: {
    textAlign: "center",
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  signup: { marginTop: 24, alignItems: "center" },
  link: { color: "#2563eb", fontWeight: "600" },
});
