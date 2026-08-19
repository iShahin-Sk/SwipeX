import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Attach JWT only to protected endpoints
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  // Skip JWT for public endpoints
  const publicRoutes = ["login/", "register/"];

  const isPublic = publicRoutes.some((route) =>
    config.url?.includes(route)
  );

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;