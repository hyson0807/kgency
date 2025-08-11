import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfoFormData {
  // Career Information
  howLong: string | null;
  selectedDays: string[];
  selectedTimes: string[];
  experience: string | null;
  experienceContent: string;
  
  // Profile Information
  name: string;
  age: string;
  gender: string | null;
  visa: string | null;
  koreanLevel: string | null;
  
  // Location & Country
  selectedLocations: number[];
  selectedMoveable: number | null;
  selectedCountry: number | null;
  
  // Job & Work Conditions
  selectedJobs: number[];
  selectedConditions: number[];
}

interface UserInfoStore {
  formData: UserInfoFormData;
  currentStep: number;
  
  // Update methods for each section
  updateCareerInfo: (data: Partial<Pick<UserInfoFormData, 
    'howLong' | 'selectedDays' | 'selectedTimes' | 'experience' | 'experienceContent'>>) => void;
  
  updateProfileInfo: (data: Partial<Pick<UserInfoFormData, 
    'name' | 'age' | 'gender' | 'visa' | 'koreanLevel'>>) => void;
  
  updateLocationInfo: (data: Partial<Pick<UserInfoFormData, 
    'selectedLocations' | 'selectedMoveable' | 'selectedCountry'>>) => void;
  
  updateJobConditions: (data: Partial<Pick<UserInfoFormData, 
    'selectedJobs' | 'selectedConditions'>>) => void;
  
  // General update method
  updateField: <K extends keyof UserInfoFormData>(field: K, value: UserInfoFormData[K]) => void;
  
  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Form management
  resetForm: () => void;
  loadFormData: (data: Partial<UserInfoFormData>) => void;
}

const initialFormData: UserInfoFormData = {
  // Career Information
  howLong: null,
  selectedDays: [],
  selectedTimes: [],
  experience: null,
  experienceContent: '',
  
  // Profile Information
  name: '',
  age: '',
  gender: null,
  visa: null,
  koreanLevel: null,
  
  // Location & Country
  selectedLocations: [],
  selectedMoveable: null,
  selectedCountry: null,
  
  // Job & Work Conditions
  selectedJobs: [],
  selectedConditions: [],
};

export const useUserInfoStore = create<UserInfoStore>()(
  devtools(
    persist(
      (set) => ({
        formData: initialFormData,
        currentStep: 1,
        
        updateCareerInfo: (data) =>
          set((state) => ({
            formData: { ...state.formData, ...data }
          })),
        
        updateProfileInfo: (data) =>
          set((state) => ({
            formData: { ...state.formData, ...data }
          })),
        
        updateLocationInfo: (data) =>
          set((state) => ({
            formData: { ...state.formData, ...data }
          })),
        
        updateJobConditions: (data) =>
          set((state) => ({
            formData: { ...state.formData, ...data }
          })),
        
        updateField: (field, value) =>
          set((state) => ({
            formData: { ...state.formData, [field]: value }
          })),
        
        setCurrentStep: (step) =>
          set({ currentStep: step }),
        
        nextStep: () =>
          set((state) => ({ currentStep: state.currentStep + 1 })),
        
        previousStep: () =>
          set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
        
        resetForm: () =>
          set({ formData: initialFormData, currentStep: 1 }),
        
        loadFormData: (data) =>
          set((state) => ({
            formData: { ...state.formData, ...data }
          })),
      }),
      {
        name: 'user-info-storage',
        storage: {
          getItem: async (name) => {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          },
          setItem: async (name, value) => {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: async (name) => {
            await AsyncStorage.removeItem(name);
          },
        },
      }
    )
  )
);