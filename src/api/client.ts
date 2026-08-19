/**
 * API Client
 *
 * Centralized Axios instance for all backend communication.
 * Every API module must use this client instead of creating
 * its own Axios instance.
 */

import axios from "axios";
import { API_TIMEOUT } from "@/config/constants";

const apiClient = axios.create({
  baseURL: "/api/method",
  withCredentials: true,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
