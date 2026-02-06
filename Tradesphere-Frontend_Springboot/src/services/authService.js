import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔐 Attach JWT automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  const res = await API.post("/api/auth/login", credentials);

  const data = res.data;

  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.id);
  localStorage.setItem("userName", data.name);
  localStorage.setItem("userRole", data.role);

  return data;
};

export const signup = (data) => {
  return API.post("/api/auth/register", data);
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

export default API;
