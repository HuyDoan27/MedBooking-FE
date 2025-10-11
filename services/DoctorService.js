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
export const createDoctor = (body) => {
  // More robust FormData detection for React Native environments
  const isFormData =
    body && (typeof body.append === "function" || body instanceof FormData);

  if (isFormData) {
    // Let axios set the multipart boundary header automatically; don't force Content-Type
    return api.post("/doctors", body, {
      headers: { Accept: "application/json" },
    });
  }

  return api.post("/doctors", body, {
    headers: { "Content-Type": "application/json" },
  });
};

// Cập nhật trạng thái bác sĩ (admin duyệt / từ chối)
export const updateDoctorStatus = (id, data, token) =>
  api.put(`/doctors/${id}/status`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // gửi JWT để authMiddleware(["admin"]) kiểm tra
      "Content-Type": "application/json",
    },
  });
