import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoEntry } from '../types';

interface VideoStore {
  videos: VideoEntry[];
  addVideo: (video: VideoEntry) => void;
  removeVideo: (id: string) => void;
  getVideo: (id: string) => VideoEntry | undefined;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set, get) => ({
      videos: [],
      addVideo: (video) =>
        set((state) => ({
          videos: [video, ...state.videos],
        })),
      removeVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((video) => video.id !== id),
        })),
      getVideo: (id) => get().videos.find((video) => video.id === id),
    }),
    {
      name: 'video-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);