import { create } from 'zustand';

export const toastStore = create((set, get) => ({
  toasts: [],
  add: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().dismiss(id), 4000);
    return id;
  },
  success: (message) => get().add(message, 'success'),
  error: (message) => get().add(message, 'error'),
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
