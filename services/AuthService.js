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

// Login
export const loginUser = (data) => api.post("/auth/login", data);
export const register = (body) => api.post("/auth/register", body)
