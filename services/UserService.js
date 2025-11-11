import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

const LOCAL_IP = "192.168.0.101";
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

// ✅ Gắn token tự động vào tất cả request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy tất cả users (chỉ admin)
export const getUsers = () => api.get("/users");

// Lấy thông tin user đang đăng nhập
export const getMe = () => api.get("/users/me");

// Tạo user mới
export const createUser = (data) => api.post("/users", data);

export const getUsersWithAppointments = () =>
  api.get("/users/with-appointments");
