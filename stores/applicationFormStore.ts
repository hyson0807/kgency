import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
// Step 1: 기본 정보 타입
interface Step1Data {
  name: string
  age: string
  gender: string | null
  visa: string | null
}
// Step 2: 경력 및 근무 정보 타입
interface Step2Data {
  howLong: string | null
  experience: string | null
  experienceContent: string
  selectedDays: string[]
  daysNegotiable: boolean
  selectedTimes: string[]
  timesNegotiable: boolean
}
// Step 3: 한국어 실력 및 질문 타입
interface Step3Data {
  koreanLevel: string | null
  topic: string | null
  question: string
}
// 전체 스토어 타입
interface ApplicationFormStore {
  // 데이터
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  
  // Step 1 액션들
  setStep1Data: (data: Partial<Step1Data>) => void
  setName: (name: string) => void
  setAge: (age: string) => void
  setGender: (gender: string | null) => void
  setVisa: (visa: string | null) => void
  
  // Step 2 액션들
  setStep2Data: (data: Partial<Step2Data>) => void
  setHowLong: (period: string | null) => void
  setExperience: (experience: string | null) => void
  setExperienceContent: (content: string) => void
  setSelectedDays: (days: string[]) => void
  setDaysNegotiable: (negotiable: boolean) => void
  setSelectedTimes: (times: string[]) => void
  setTimesNegotiable: (negotiable: boolean) => void
  
  // Step 3 액션들
  setStep3Data: (data: Partial<Step3Data>) => void
  setKoreanLevel: (level: string | null) => void
  setTopic: (topic: string | null) => void
  setQuestion: (question: string) => void
  
  // 유틸리티 액션들
  resetAllData: () => void
  getCurrentStep1Data: () => Step1Data
  getCurrentStep2Data: () => Step2Data
  getCurrentStep3Data: () => Step3Data
  isDataEmpty: () => boolean
  
  // 데이터베이스에서 기본값 로드
  loadFromProfile: (profile: any) => void
}
// 초기 상태
const initialStep1: Step1Data = {
  name: '',
  age: '',
  gender: null,
  visa: null,
}
const initialStep2: Step2Data = {
  howLong: null,
  experience: null,
  experienceContent: '',
  selectedDays: [],
  daysNegotiable: false,
  selectedTimes: [],
  timesNegotiable: false,
}
const initialStep3: Step3Data = {
  koreanLevel: null,
  topic: null,
  question: '',
}
// Zustand Store 생성
export const useApplicationFormStore = create<ApplicationFormStore>()(
  persist(
      (set, get) => ({
      // 초기 데이터
      step1: initialStep1,
      step2: initialStep2,
      step3: initialStep3,
      
      // Step 1 액션들
      setStep1Data: (data) =>
        set((state) => ({
          step1: { ...state.step1, ...data }
        })),
        
      setName: (name) =>
        set((state) => ({
          step1: { ...state.step1, name }
        })),
        
      setAge: (age) =>
        set((state) => ({
          step1: { ...state.step1, age }
        })),
        
      setGender: (gender) =>
        set((state) => ({
          step1: { ...state.step1, gender }
        })),
        
      setVisa: (visa) =>
        set((state) => ({
          step1: { ...state.step1, visa }
        })),
      
      // Step 2 액션들
      setStep2Data: (data) =>
        set((state) => ({
          step2: { ...state.step2, ...data }
        })),
        
      setHowLong: (period) =>
        set((state) => ({
          step2: { ...state.step2, howLong: period }
        })),
        
      setExperience: (experience) =>
        set((state) => ({
          step2: { ...state.step2, experience }
        })),
        
      setExperienceContent: (content) =>
        set((state) => ({
          step2: { ...state.step2, experienceContent: content }
        })),
        
      setSelectedDays: (days) =>
        set((state) => ({
          step2: { ...state.step2, selectedDays: days }
        })),
        
      setDaysNegotiable: (negotiable) =>
        set((state) => ({
          step2: { ...state.step2, daysNegotiable: negotiable }
        })),
        
      setSelectedTimes: (times) =>
        set((state) => ({
          step2: { ...state.step2, selectedTimes: times }
        })),
        
      setTimesNegotiable: (negotiable) =>
        set((state) => ({
          step2: { ...state.step2, timesNegotiable: negotiable }
        })),
        
      // Step 3 액션들
      setStep3Data: (data) =>
        set((state) => ({
          step3: { ...state.step3, ...data }
        })),
        
      setKoreanLevel: (level) =>
        set((state) => ({
          step3: { ...state.step3, koreanLevel: level }
        })),
        
      setTopic: (topic) =>
        set((state) => ({
          step3: { ...state.step3, topic }
        })),
        
      setQuestion: (question) =>
        set((state) => ({
          step3: { ...state.step3, question }
        })),
      
      // 유틸리티 액션들
      resetAllData: () =>
        set(() => ({
          step1: initialStep1,
          step2: initialStep2,
          step3: initialStep3
        })),
        
      getCurrentStep1Data: () => get().step1,
      getCurrentStep2Data: () => get().step2,
      getCurrentStep3Data: () => get().step3,
      
      // 데이터가 비어있는지 확인
      isDataEmpty: () => {
        const state = get()
        
        // Step 1 데이터 확인
        const step1HasData = state.step1.name.trim() !== '' ||
                           state.step1.age.trim() !== '' ||
                           state.step1.gender !== null ||
                           state.step1.visa !== null
        
        // Step 2 데이터 확인
        const step2HasData = state.step2.howLong !== null ||
                           state.step2.experience !== null ||
                           state.step2.experienceContent.trim() !== '' ||
                           state.step2.selectedDays.length > 0 ||
                           state.step2.selectedTimes.length > 0
        
        // Step 3 데이터 확인
        const step3HasData = state.step3.koreanLevel !== null ||
                           state.step3.topic !== null ||
                           state.step3.question.trim() !== ''
        
        return !step1HasData && !step2HasData && !step3HasData
      },
      
      // 프로필에서 기본값 로드
      loadFromProfile: (profile) => {
        if (!profile) return
        
        set((state) => ({
          step1: {
            ...state.step1,
            name: profile.name || '',
            age: profile.user_info?.age?.toString() || '',
            gender: profile.user_info?.gender || null,
            visa: profile.user_info?.visa || null,
          },
          step2: {
            ...state.step2,
            howLong: profile.user_info?.how_long || null,
            experience: profile.user_info?.experience || null,
            experienceContent: profile.user_info?.experience_content || '',
            selectedDays: profile.user_info?.preferred_days || [],
            selectedTimes: profile.user_info?.preferred_times || [],
          },
          step3: {
            ...state.step3,
            koreanLevel: profile.user_info?.korean_level || null,
            topic: profile.user_info?.topic || null,
          }
        }))
      },
    }),
    {
      name: 'application-form-draft',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name)
        }
      },
      // 모든 데이터를 persist
      partialize: (state) => ({
        step1: state.step1,
        step2: state.step2,
        step3: state.step3
      })
    }
  )
)
// 편의 함수들
export const useStep1Data = () => useApplicationFormStore((state) => state.step1)
export const useStep2Data = () => useApplicationFormStore((state) => state.step2)
export const useStep3Data = () => useApplicationFormStore((state) => state.step3)