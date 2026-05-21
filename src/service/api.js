import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {

  if (typeof window !== "undefined") {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {

    if (
      error.response?.status === 401
    ) {

      const isLoginPage =
        window.location.pathname === "/login";

      // só limpa se existir token
      const hasToken =
        !!localStorage.getItem("token");

      if (hasToken) {

        localStorage.removeItem("token");

        localStorage.removeItem(
          "expiresAt"
        );

        localStorage.removeItem(
          "usuarioLogado"
        );
      }

      // evita toast duplicado no login
      if (!isLoginPage) {

        toast.warning(
          "Sua sessão expirou. Faça login novamente."
        );

        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;