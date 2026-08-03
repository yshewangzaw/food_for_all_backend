/**
 * ============================================================================
 * TEST MODE — FAKE AUTHENTICATION
 * ============================================================================
 *
 * Lets you reach the dashboard without a running backend. Sign-in accepts any
 * email and password (or you can skip the form entirely) and a fake ADMIN
 * session is written to storage, so PrivateRoute lets you through.
 *
 * Turn it on in .env:
 *
 *     VITE_USE_FAKE_AUTH=true
 *
 * Turn it off by setting it to false or deleting the line. Nothing else in the
 * app needs changing — every other file goes through authService, which checks
 * this flag first.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS DOES NOT DO
 * ---------------------------------------------------------------------------
 * This fakes the LOGIN only. It does not fake your data. Every page still
 * calls the real API, so with no backend running the tables will show
 * "Can't reach the server" and an empty state. That is the honest behaviour —
 * you'll be testing the real layout, routing, modals, forms, validation and
 * error states, just not real records.
 *
 * ---------------------------------------------------------------------------
 * BEFORE YOU DEPLOY
 * ---------------------------------------------------------------------------
 * Set VITE_USE_FAKE_AUTH=false (or remove it) in whatever .env your build uses.
 * While it is on, a bright banner sits across the top of every page so nobody
 * mistakes a test session for a real one.
 * ============================================================================
 */

/** Reads the flag. Vite inlines env vars as strings, so compare to "true". */
export const isFakeAuthEnabled = () =>
  String(import.meta.env.VITE_USE_FAKE_AUTH).toLowerCase() === "true";

/** The account you are signed in as while test mode is on. */
export const FAKE_USER = {
  id: 1,
  fullName: "Test Administrator",
  email: "test.admin@example.com",
  role: "ADMIN",
};

/** Obviously not a real JWT — it will be rejected by any protected endpoint. */
export const FAKE_TOKEN = "fake-token.for-local-testing-only.not-a-real-jwt";

/**
 * Stands in for POST /api/auth/login.
 * Accepts anything, waits a moment so you can see the button's loading state,
 * and returns the same shape the real endpoint does.
 */
export const fakeLogin = async (credentials = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    token: FAKE_TOKEN,
    user: {
      ...FAKE_USER,
      // Use whatever email was typed, so it's clear the form was read.
      email: credentials.email || FAKE_USER.email,
    },
  };
};

/** Stands in for POST /api/auth/register. */
export const fakeRegister = async (values = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    id: 999,
    fullName: values.fullName || "New Test Member",
    email: values.email || "new.member@example.com",
    phone: values.phone || "+251900000000",
    referralCode: `TEST${Date.now()}`,
    role: "MEMBER",
  };
};

export default {
  isFakeAuthEnabled,
  FAKE_USER,
  FAKE_TOKEN,
  fakeLogin,
  fakeRegister,
};
