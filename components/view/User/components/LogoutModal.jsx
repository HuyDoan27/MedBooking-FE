import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "@/services/AuthService";

const LogoutModal = ({ visible, onClose, onLogoutSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setLoading(true);
      
      // Lấy token từ storage
      const token = await AsyncStorage.getItem("token");
      
      // Gọi API logout nếu có token
      if (token) {
        try {
          await logout(token);
        } catch (err) {
          console.warn("⚠️ Lỗi gọi API logout:", err.message);
          // Tiếp tục xóa storage ngay cả khi API fail
        }
      }

      // Xóa dữ liệu trong storage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // Đóng modal trước
      onClose();
      
      // Sau đó gọi callback để reset state ở Page component
      setTimeout(() => {
        if (onLogoutSuccess) {
          onLogoutSuccess();
        }
      }, 300);
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Đăng xuất</Text>
          <Text style={styles.message}>Bạn có chắc muốn đăng xuất không?</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleConfirmLogout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.logoutText}>Đăng xuất</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  message: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});