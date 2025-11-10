import axios from "axios";
import { Platform } from "react-native";

// ⚙️ Địa chỉ IP của máy tính bạn (kiểm tra bằng ipconfig / ifconfig)
const LOCAL_IP = "192.168.0.105"; // ⚠️ đổi thành IP thật của máy bạn
const PORT = 5000;

// ✅ Tự động chọn baseURL phù hợp
const BASE_URL =
  Platform.OS === "web"
    ? `http://localhost:${PORT}/api`
    : `http://${LOCAL_IP}:${PORT}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Login
export const loginUser = (data) => api.post("/auth/login", data);
export const register = (body) => api.post("/auth/register", body);
export const logout = (token) =>
  api.post(
    "auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
