import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Adiciona o token em todas as requisições se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;