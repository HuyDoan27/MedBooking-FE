import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// ⚙️ Địa chỉ IP của máy tính bạn (kiểm tra bằng ipconfig / ifconfig)
const LOCAL_IP = "192.168.0.101"; // ⚠️ đổi thành IP thật của máy bạn
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

// Lấy danh sách appointment theo doctorId kèm filter
export const getAppointmentsByDoctor = (
  userId,
  { date, status, patientName } = {}
) => {
  return api.get(`/appointments/${userId}`, {
    params: { date, status, patientName },
  });
};

// Lấy danh sách lịch hẹn của bác sĩ trong ngày hôm nay
export const getTodayAppointmentsByDoctor = async (userId) => {
  return api.get(`/appointments/today/${userId}`);
};


// Lấy danh sách lịch hẹn của user
export const getUserAppointments = async (userId, params = {}) => {
  const token = await AsyncStorage.getItem("token");

  return api.get(`/appointments/user/${userId}`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Lấy chi tiết một lịch hẹn
export const getAppointmentById = (appointmentId, userId) =>
  api.get(`/appointments/${appointmentId}`, { params: { userId } });

// Tạo lịch hẹn mới
export const createAppointment = (data, token) =>
  api.post("/appointments", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Cập nhật trạng thái lịch hẹn
export const updateAppointmentStatus = (appointmentId, data) =>
  api.patch(`/appointments/${appointmentId}/status`, data);

// Dời lịch hẹn
export const rescheduleAppointment = (appointmentId, data) =>
  api.put(`/appointments/${appointmentId}/reschedule`, data);

// Đánh giá sau khám
export const rateAppointment = (appointmentId, data) =>
  api.put(`/appointments/${appointmentId}/rate`, data);

// Lấy thống kê lịch hẹn của user
export const getUserAppointmentStats = (userId) =>
  api.get(`/appointments/user/${userId}/stats`);

// 🩺 Bác sĩ gửi thông tin khám bệnh sau khi hoàn thành lịch hẹn
export const submitMedicalReport = async (appointmentId, data) => {
  const token = await AsyncStorage.getItem("token");

  return api.post(`/appointments/${appointmentId}/medical-report`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Lấy danh sách báo cáo bệnh án của một bệnh nhân (user)
export const getMedicalReportsByPatient = async (userId) => {
  const token = await AsyncStorage.getItem("token");
  return api.get(`/appointments/user/${userId}/medical-reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


// 📊 Lấy số lượng lịch khám theo tất cả trạng thái
export const getAppointmentStatusCount = async () => {
  const token = await AsyncStorage.getItem("token");
  const userData = await AsyncStorage.getItem("user");
  if (!userData) throw new Error("Không tìm thấy thông tin người dùng");

  const user = JSON.parse(userData);
  const userId = user._id || user.id;

  return api.get(`/appointments/status-count/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
