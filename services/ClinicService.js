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

export const getClinicsWithDoctors = () => api.get("/clinics");

// Lấy danh sách chuyên khoa theo phòng khám
export const getSpecialtiesByClinic = (clinicId) =>
  api.get(`/clinics/${clinicId}/specialties`);

export const createClinic = (body) => api.post("/clinics/create", body);
