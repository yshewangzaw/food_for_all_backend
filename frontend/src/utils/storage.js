/**
 * The ONLY file allowed to touch localStorage.
 * Every other file must import this module instead.
 */

const TOKEN_KEY = "cms_token";
const USER_KEY = "cms_user";

const read = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    // Private browsing / storage disabled.
    return null;
  }
};

const write = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // Ignore: the app still works for the current session.
  }
};

const remove = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Ignore.
  }
};

const storage = {
  setToken: (token) => write(TOKEN_KEY, token),
  getToken: () => read(TOKEN_KEY),
  removeToken: () => remove(TOKEN_KEY),

  setUser: (user) => write(USER_KEY, JSON.stringify(user)),
  getUser: () => {
    const raw = read(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  },
  removeUser: () => remove(USER_KEY),

  clear: () => {
    remove(TOKEN_KEY);
    remove(USER_KEY);
  },
};

export default storage;
