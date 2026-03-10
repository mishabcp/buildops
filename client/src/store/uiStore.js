import { create } from 'zustand';

export const uiStore = create((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set((state) => ({ sidebarOpen: open !== undefined ? open : !state.sidebarOpen })),
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
