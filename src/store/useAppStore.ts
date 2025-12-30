import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { User } from '../types/api';

const storage = createMMKV()

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.remove(name);
  },
};

export type TimezonePreference = 'local' | 'America/New_York';

interface AppState {
  timezonePreference: TimezonePreference;
  user: User | null;
  toggleTimezone: () => void;
  setUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      timezonePreference: 'local',
      user: null,
      toggleTimezone: () =>
        set((state) => ({
          timezonePreference:
            state.timezonePreference === 'local' ? 'America/New_York' : 'local',
        })),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
