import axios from "axios";
import { triggerLogout } from "@/features/auth/authStore";

export const http = axios.create({
  baseURL: "/api",
});

let isLoggingOut = false;

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status: number | undefined = error?.response?.status;

    if ((status === 401 || status === 403) && !isLoggingOut) {
      isLoggingOut = true;

      triggerLogout();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
