import { create } from 'zustand';

const TOKEN_KEY = 'buildops-token';

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const authStore = create((set, get) => ({
  user: null,
  token: getStoredToken(),
  setAuth: (user, token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
  setUser: (user) => set({ user }),
}));
