import { loginUser } from "@/services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export default function LoginScreen({
  onSwitchToRegister,
  onLoginSuccess,
}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await loginUser({
        email: email.trim(),
        password: password,
      });

      const { token, user } = res.data;
      console.log("Login response:", res.data);

      if (!token) {
        throw new Error("Không nhận được token từ server");
      }

      // Lưu thông tin
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("rememberMe", rememberMe ? "true" : "false");

      // ✅ Hiển thị toast thành công
      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công 🎉",
        text2: `Chào mừng ${user?.firstName || "bạn"} trở lại!`,
      });

      if (onLoginSuccess) onLoginSuccess(res.data);
    } catch (error: any) {

      // ✅ Hiển thị toast lỗi
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại ❌",
        text2:
          error?.response?.data?.message ||
          error.message ||
          "Vui lòng kiểm tra lại email hoặc mật khẩu",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Heart size={40} color="#fff" />
        </View>
        <Text style={styles.title}>MedBooking</Text>
        <Text style={styles.subtitle}>Đặt lịch khám bệnh dễ dàng</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đăng nhập</Text>
        <Text style={styles.cardSubtitle}>Chào mừng bạn quay trở lại!</Text>

        {/* Phone input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Password input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.iconRight}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} color="#6b7280" />
              ) : (
                <Eye size={18} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember me + forgot */}
        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            />
            <Text style={styles.checkboxLabel}>Ghi nhớ đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!email || !password) && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={!email || !password}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
          <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* Sign up */}
      <View style={styles.signup}>
        <Text style={{ color: "#4b5563" }}>
          Chưa có tài khoản?{" "}
          <Text style={styles.link} onPress={onSwitchToRegister}>
            Đăng ký ngay
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f9ff",
    padding: 24,
    paddingTop: 100,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#0891b2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280" },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  input: { flex: 1, height: 48, fontSize: 16, paddingHorizontal: 8 },
  iconLeft: { marginRight: 4 },
  iconRight: { padding: 6 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 4,
    marginRight: 6,
  },
  checkboxChecked: { backgroundColor: "#3b82f6" },
  checkboxLabel: { fontSize: 14, color: "#4b5563" },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0891b2",
    height: 50,
    borderRadius: 12,
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { marginHorizontal: 8, color: "#6b7280", fontSize: 14 },

  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  socialIconText: { color: "white", fontSize: 12, fontWeight: "bold" },
  socialText: { fontSize: 15, color: "#111827" },

  signup: { marginTop: 24, alignItems: "center" },
  link: { color: "#0891b2", fontWeight: "600" },
});
