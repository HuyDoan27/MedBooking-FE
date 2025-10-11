import axios from "axios";

// ⚠️ Cấu hình BASE_URL tuỳ môi trường
const BASE_URL = "http://localhost:5000/api"; 
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// Device thật: IP máy tính (vd: http://192.168.1.100:5000)

// Tạo axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Thêm token tự động nếu có trong localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // hoặc AsyncStorage trên React Native
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy tất cả users (chỉ admin)
export const getUsers = () => api.get("/users");

// Lấy thông tin user đang đăng nhập
export const getMe = () => api.get("/users/me");

// Tạo user mới
export const createUser = (data) => api.post("/users", data);

export default api;
