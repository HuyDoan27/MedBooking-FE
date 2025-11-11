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

// Lấy ngẫu nhiên 3-5 bác sĩ
export const getRandomDoctors = () => api.get("/doctors/random");

// Lấy danh sách bác sĩ (có thể truyền query để search/filter)
export const getDoctors = (params) => api.get("/doctors", { params });

export const getAllDoctors = (params) => api.get("/doctors/all", { params });

// Lấy chi tiết 1 bác sĩ
export const getDoctorById = (id) => api.get(`/doctors/${id}`);

// Lấy danh sách bác sĩ theo chuyên khoa (filter)
export const getDoctorsBySpecialty = (params) =>
  api.get("/doctors/specialty", { params });

// Tạo bác sĩ (hỗ trợ JSON hoặc FormData cho upload)
export const createDoctor = async (body) => {
  try {
    const config = {
      headers: {
        Accept: "application/json",
      },
    };

    // Nếu body không phải FormData, set Content-Type JSON
    if (!(body instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    const res = await api.post("/doctors", body, config);
    return res.data; // trả về data luôn
  } catch (err) {
    console.error(
      "createDoctor error:",
      err?.response?.data?.message || err.message
    );
    throw err;
  }
};

// Cập nhật trạng thái bác sĩ (admin duyệt/từ chối)
export const updateDoctorStatus = async (id, data) => {
  try {
    const res = await api.put(`/doctors/${id}/status`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error(
      "updateDoctorStatus error:",
      err?.response?.data?.message || err.message
    );
    throw err;
  }
};
