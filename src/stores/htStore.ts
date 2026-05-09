import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Specialist = "trainer" | "nutritionist" | "endocrinologist";

export type TrainingModality =
  | "powerlifting"
  | "bodybuilding"
  | "martial_arts_striking"
  | "martial_arts_grappling"
  | "martial_arts_mma"
  | "calisthenics"
  | "crossfit"
  | "performance_bodybuilding"
  | "custom";

export interface TrainingStack {
  primary: TrainingModality | string;
  secondary?: TrainingModality | string;
  tertiary?: TrainingModality | string;
  goal: string;
  height: number;
  weight: number;
  conditions: string;
  trainingContext?: string;
  age?: number;
  trainingYears?: number;
  gender?: string;
  bodyFatPct?: number;
  activityLevel?: string;
}

export interface DeliberationMessage {
  role: 'user' | 'assistant';
  content: string;
  isCascade?: boolean;
}

export interface Deliberation {
  id: string;
  topic: string;
  createdAt: string;
  nextReviewAt?: string | null;
  notes?: string | null;
  messages: DeliberationMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  trainingStack?: TrainingStack;
  preferredModel?: string;
}

interface HTStore {
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;
  profiles: Record<string, UserProfile>;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  updateTrainingStack: (profileId: string, stack: TrainingStack) => void;
  
  // App UI State
  activeSpecialist: Specialist;
  setActiveSpecialist: (s: Specialist) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setProfiles: (profiles: Record<string, UserProfile>) => void;
  removeProfile: (id: string) => void;

  // Deliberations
  deliberations: Deliberation[];
  setDeliberations: (delibs: Deliberation[]) => void;

  // Syncing
  isHydrated: boolean;
  hydrate: () => Promise<void>;
}

// INITIAL_PROFILES REMOVED - NOW FED BY PRISMA DB

export const useHTStore = create<HTStore>()(
  persist(
    (set) => ({
      activeProfileId: null,
      setActiveProfileId: (id) => set({ activeProfileId: id }),
      
      profiles: {},
      setProfiles: (profiles) => set({ profiles }),
      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [id]: { ...state.profiles[id], ...updates },
          },
        })),
        
      removeProfile: (id) =>
        set((state) => {
          const newProfiles = { ...state.profiles };
          delete newProfiles[id];
          return {
            profiles: newProfiles,
            activeProfileId: state.activeProfileId === id ? null : state.activeProfileId
          };
        }),
        
      updateTrainingStack: (profileId, stack) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [profileId]: {
              ...state.profiles[profileId],
              trainingStack: stack
            }
          }
        })),

      activeSpecialist: "trainer",
      setActiveSpecialist: (s) => set({ activeSpecialist: s }),
      
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      deliberations: [],
      setDeliberations: (delibs) => set({ deliberations: delibs }),

      isHydrated: false,
      hydrate: async () => {
        const { activeProfileId } = useHTStore.getState();
        try {
          // 1. Fetch Profiles
          const pRes = await fetch('/api/profiles');
          const pData = await pRes.json();
          if (pData.profiles) set({ profiles: pData.profiles });

          // 2. Fetch Deliberations if profile active
          if (activeProfileId) {
            const dRes = await fetch(`/api/deliberations?profileId=${activeProfileId}`);
            const dData = await dRes.json();
            if (Array.isArray(dData)) set({ deliberations: dData });
          }

          set({ isHydrated: true });
        } catch (err) {
          console.error("Hydration failed:", err);
        }
      },
    }),
    {
      name: 'health-team-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
