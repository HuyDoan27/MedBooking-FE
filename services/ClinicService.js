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

export const getClinicsWithDoctors = () => api.get("/clinics");

// Lấy danh sách chuyên khoa theo phòng khám
export const getSpecialtiesByClinic = (clinicId) =>
  api.get(`/clinics/${clinicId}/specialties`);

export const createClinic = (body) => api.post("/clinics/create", body);
