import axios from "axios";
import toast from "react-hot-toast";
import storage from "../utils/storage";
import { ERROR_MESSAGES } from "../constants/appConstants";
import { ROUTES } from "../constants/routes";
import { isFakeAuthEnabled } from "../services/fakeAuth";

/**
 * One axios instance for the whole app. Never call axios directly elsewhere —
 * import this file so the token and error handling always apply.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

/* ------------------------------------------------------------------
   REQUEST INTERCEPTOR — attach the JWT to every outgoing call.
   The backend's authMiddleware reads "Authorization: Bearer <token>".
------------------------------------------------------------------ */
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** Pulls the most specific message available out of a failed response. */
const readServerMessage = (error) => {
  const body = error.response?.data;
  if (!body) return null;
  if (typeof body === "string") return body;
  if (body.message) return body.message;
  if (Array.isArray(body.errors) && body.errors.length) {
    return body.errors.map((item) => item.message || item).join(", ");
  }
  return null;
};

/* ------------------------------------------------------------------
   RESPONSE INTERCEPTOR — unwrap success, translate every failure into
   one friendly toast, and sign the user out on 401.
------------------------------------------------------------------ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // The caller can pass { skipErrorToast: true } to handle the error itself.
    const silent = error.config?.skipErrorToast;
    const status = error.response?.status;
    let message;

    if (error.code === "ECONNABORTED") {
      message = "The request timed out. Try again.";
    } else if (!error.response) {
      message = ERROR_MESSAGES.NETWORK;
    } else {
      message = readServerMessage(error) || ERROR_MESSAGES[status] || ERROR_MESSAGES.UNKNOWN;
    }

    // In test mode the token is deliberately fake, so a protected endpoint
    // answering 401 is expected. Signing out here would bounce you back to the
    // login page the moment any page loaded, which would make the bypass
    // useless — so we leave the fake session alone and just show the toast.
    if (status === 401 && !isFakeAuthEnabled()) {
      storage.clear();
      // Full reload so every piece of in-memory state is dropped with the token.
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.replace(ROUTES.LOGIN);
      }
    }

    const isAuthRequest = /\/auth\/(login|register)/.test(error.config?.url || "");
    if (!silent && !(status === 404 && isAuthRequest)) {
      toast.error(message);
    }

    // Hand a plain, predictable object to the calling service.
    return Promise.reject({ status, message, original: error });
  }
);

export default api;
