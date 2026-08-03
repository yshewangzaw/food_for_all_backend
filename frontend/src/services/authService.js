import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";
import storage from "../utils/storage";
import { isFakeAuthEnabled, fakeLogin, fakeRegister } from "./fakeAuth";

/**
 * Backend: routes/authRoutes.js
 *   POST /api/auth/login    -> { success, data: { user: { id, fullName, email, role }, token } }
 *   POST /api/auth/register -> { success, data: { id, fullName, email, phone, referralCode, role } }
 *
 * When VITE_USE_FAKE_AUTH=true, login and register are answered locally by
 * services/fakeAuth.js instead of the API, so you can reach the dashboard with
 * no backend running. See that file for the full explanation.
 */
const authService = {
  login: async ({ email, password }) => {
    // ---- TEST MODE: no API call, any credentials are accepted ----
    if (isFakeAuthEnabled()) {
      const result = await fakeLogin({ email, password });
      storage.setToken(result.token);
      storage.setUser(result.user);
      return result;
    }

    // ---- REAL API ----
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    const result = response.data?.data;

    if (!result?.token) {
      throw new Error("The server didn't return a token.");
    }

    storage.setToken(result.token);
    storage.setUser(result.user);
    return result;
  },

  /**
   * The backend accepts fullName, email, phone, password and an optional
   * referralCode (authService.register looks the sponsor up by it).
   * It does NOT return a token, so the user is sent to the login page after.
   */
  forgotPassword: async ({ identifier }) => {
    const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { identifier });
    return response.data;
  },

  register: async ({ fullName, email, phone, password, referralCode }) => {
    // ---- TEST MODE ----
    if (isFakeAuthEnabled()) {
      return fakeRegister({ fullName, email, phone, referralCode });
    }

    // ---- REAL API ----
    const payload = { fullName, email, phone, password };
    if (referralCode) {
      payload.referralCode = referralCode;
    }
    const response = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
    const data = response.data?.data ?? null;
    if (!data) {
      throw new Error("Registration failed.");
    }
    return data;
  },

  logout: () => {
    // The backend issues stateless JWTs with no revoke route, so signing out
    // is purely a client-side matter.
    storage.clear();
  },

  /**
   * TODO(backend): add GET /api/auth/me so the session can be re-verified on
   * reload. Until then the user object saved at login is the source of truth.
   */
  getCurrentUser: () => storage.getUser(),

  isAuthenticated: () => Boolean(storage.getToken()),
};

export default authService;
