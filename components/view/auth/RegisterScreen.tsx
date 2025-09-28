import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  ArrowRight,
  Heart,
  User,
  Mail,
} from "lucide-react-native";
import { register } from "@/services/AuthService";

export default function RegisterScreen({
  onSwitchToLogin,
  onRegisterSuccess,
}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleRegister = async () => {
    if (!formData.agreeTerms) {
      alert("Bạn cần đồng ý với Điều khoản và Chính sách trước khi đăng ký.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      const res = await register(payload);
      console.log("Register success:", res);

      if (onRegisterSuccess) {
        onRegisterSuccess(res);
      }

      alert("Đăng ký thành công!");
    } catch (err: any) {
      console.error("Register error:", err);
      const backendMsg = err?.response?.data?.message;

      alert(backendMsg || "Đăng ký thất bại, vui lòng thử lại.");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.phoneNumber &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.agreeTerms;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Heart size={40} color="#fff" />
        </View>
        <Text style={styles.title}>MedBooking</Text>
        <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đăng ký</Text>
        <Text style={styles.cardSubtitle}>
          Tham gia cùng chúng tôi ngay hôm nay!
        </Text>

        {/* Full name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={styles.input}
              placeholder=""
              value={formData.fullName}
              onChangeText={(val) => handleInputChange("fullName", val)}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={styles.input}
              placeholder=""
              value={formData.email}
              onChangeText={(val) => handleInputChange("email", val)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputWrapper}>
            <Phone size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={styles.input}
              placeholder="0901 234 567"
              value={formData.phoneNumber}
              onChangeText={(val) => handleInputChange("phoneNumber", val)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 8 ký tự"
              value={formData.password}
              onChangeText={(val) => handleInputChange("password", val)}
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

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChangeText={(val) => handleInputChange("confirmPassword", val)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.iconRight}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} color="#6b7280" />
              ) : (
                <Eye size={18} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
          {formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <Text style={styles.errorText}>Mật khẩu không khớp</Text>
            )}
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => handleInputChange("agreeTerms", !formData.agreeTerms)}
        >
          <View
            style={[
              styles.checkbox,
              formData.agreeTerms && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>
            Tôi đồng ý với <Text style={styles.link}>Điều khoản sử dụng</Text>{" "}
            và <Text style={styles.link}>Chính sách bảo mật</Text>
          </Text>
        </TouchableOpacity>

        {/* Register button */}
        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>Tạo tài khoản</Text>
          <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Hoặc</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Register */}
      </View>

      {/* Login link */}
      <View style={styles.signup}>
        <Text style={{ color: "#4b5563" }}>
          Đã có tài khoản?{" "}
          <Text style={styles.link} onPress={onSwitchToLogin}>
            Đăng nhập ngay
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f9ff",
    padding: 24,
    alignItems: "center",
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

  errorText: { color: "#ef4444", fontSize: 13, marginTop: 4 },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: "#3b82f6" },
  checkboxLabel: { fontSize: 14, color: "#4b5563", flex: 1 },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
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
  link: { color: "#2563eb", fontWeight: "600" },
});
