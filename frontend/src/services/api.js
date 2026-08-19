import axios from "axios";

// Use environment variable for backend API URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT only to protected endpoints
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  // Skip JWT for public endpoints
  const publicRoutes = ["login/", "register/"];
  const isPublic = publicRoutes.some((route) => config.url?.includes(route));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
