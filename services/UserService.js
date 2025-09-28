import axios from "axios";

// ⚠️ Cấu hình BASE_URL tuỳ môi trường
const BASE_URL = "http://localhost:5000/api"; 
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Device thật: IP máy tính (vd: http://192.168.1.100:5000)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Lấy danh sách users
export const getUsers = () => api.get("/users");



