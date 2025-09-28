import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ⚠️ BASE_URL cần đổi theo môi trường
const BASE_URL = "http://localhost:5000/api";
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Device thật: IP máy tính (vd: http://192.168.1.100:5000)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Lấy danh sách lịch hẹn của user
export const getUserAppointments = async (userId, params = {}) => {
  const token = await AsyncStorage.getItem("token"); // lấy token đã lưu khi login

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
// client/api/appointment.js
export const createAppointment = (data, token) =>
  api.post("/appointments", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Cập nhật trạng thái lịch hẹn
export const updateAppointmentStatus = (appointmentId, data) =>
  api.put(`/appointments/${appointmentId}/status`, data);

// Dời lịch hẹn
export const rescheduleAppointment = (appointmentId, data) =>
  api.put(`/appointments/${appointmentId}/reschedule`, data);

// Đánh giá sau khám
export const rateAppointment = (appointmentId, data) =>
  api.put(`/appointments/${appointmentId}/rate`, data);

// Lấy thống kê lịch hẹn của user
export const getUserAppointmentStats = (userId) =>
  api.get(`/appointments/user/${userId}/stats`);
