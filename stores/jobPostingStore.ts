import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
// Step 1: 기본 정보 타입
interface Step1Data {
  jobTitle: string
  jobDescription: string
  hiringCount: string
  jobAddress: string
  interviewLocation: string
  specialNotes: string
  isEditMode: boolean
  jobPostingId?: string
}
// Step 2: 근무 정보 타입
interface Step2Data {
  selectedLocation: number | null
  workingHours: string
  workingHoursNegotiable: boolean
  workingDays: string[]
  workingDaysNegotiable: boolean
  salaryType: string
  salaryRange: string
  salaryRangeNegotiable: boolean
  payDay: string
  payDayNegotiable: boolean
}
// Step 3: 인재 선호 정보 타입
interface Step3Data {
  selectedCountries: number[]
  selectedJobs: number[]
  selectedConditions: number[]
  selectedAgeRanges: number[]
  selectedGenders: number[]
  selectedVisas: number[]
  selectedKoreanLevels: number[]
  isPostingActive: boolean
}
// 전체 스토어 타입
interface JobPostingStore {
  // 데이터
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  
  // Step 1 액션들
  setStep1Data: (data: Partial<Step1Data>) => void
  setJobTitle: (title: string) => void
  setJobDescription: (description: string) => void
  setHiringCount: (count: string) => void
  setJobAddress: (address: string) => void
  setInterviewLocation: (location: string) => void
  setSpecialNotes: (notes: string) => void
  setEditMode: (isEdit: boolean, jobPostingId?: string) => void
  
  // Step 2 액션들
  setStep2Data: (data: Partial<Step2Data>) => void
  setSelectedLocation: (location: number | null) => void
  setWorkingHours: (hours: string) => void
  setWorkingHoursNegotiable: (negotiable: boolean) => void
  setWorkingDays: (days: string[]) => void
  setWorkingDaysNegotiable: (negotiable: boolean) => void
  setSalaryType: (type: string) => void
  setSalaryRange: (range: string) => void
  setSalaryRangeNegotiable: (negotiable: boolean) => void
  setPayDay: (day: string) => void
  setPayDayNegotiable: (negotiable: boolean) => void
  
  // Step 3 액션들
  setStep3Data: (data: Partial<Step3Data>) => void
  setSelectedCountries: (countries: number[]) => void
  setSelectedJobs: (jobs: number[]) => void
  setSelectedConditions: (conditions: number[]) => void
  setSelectedAgeRanges: (ages: number[]) => void
  setSelectedGenders: (genders: number[]) => void
  setSelectedVisas: (visas: number[]) => void
  setSelectedKoreanLevels: (levels: number[]) => void
  setIsPostingActive: (active: boolean) => void
  
  // 유틸리티 액션들
  resetAllData: () => void
  getCurrentStep1Data: () => Step1Data
  getCurrentStep2Data: () => Step2Data
  getCurrentStep3Data: () => Step3Data
  
  // 페이지 이탈 시 사용할 함수들
  isDataEmpty: () => boolean
  confirmReset: () => Promise<boolean>
}
// 초기 상태
const initialStep1: Step1Data = {
  jobTitle: '',
  jobDescription: '',
  hiringCount: '1',
  jobAddress: '',
  interviewLocation: '',
  specialNotes: '',
  isEditMode: false,
  jobPostingId: undefined
}
const initialStep2: Step2Data = {
  selectedLocation: null,
  workingHours: '',
  workingHoursNegotiable: false,
  workingDays: [],
  workingDaysNegotiable: false,
  salaryType: 'monthly',
  salaryRange: '',
  salaryRangeNegotiable: false,
  payDay: '',
  payDayNegotiable: false
}
const initialStep3: Step3Data = {
  selectedCountries: [],
  selectedJobs: [],
  selectedConditions: [],
  selectedAgeRanges: [],
  selectedGenders: [],
  selectedVisas: [],
  selectedKoreanLevels: [],
  isPostingActive: true
}
// Zustand Store 생성
export const useJobPostingStore = create<JobPostingStore>()(
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
        
      setJobTitle: (title) =>
        set((state) => ({
          step1: { ...state.step1, jobTitle: title }
        })),
        
      setJobDescription: (description) =>
        set((state) => ({
          step1: { ...state.step1, jobDescription: description }
        })),
        
      setHiringCount: (count) =>
        set((state) => ({
          step1: { ...state.step1, hiringCount: count }
        })),
        
      setJobAddress: (address) =>
        set((state) => ({
          step1: { ...state.step1, jobAddress: address }
        })),
        
      setInterviewLocation: (location) =>
        set((state) => ({
          step1: { ...state.step1, interviewLocation: location }
        })),
        
      setSpecialNotes: (notes) =>
        set((state) => ({
          step1: { ...state.step1, specialNotes: notes }
        })),
        
      setEditMode: (isEdit, jobPostingId) =>
        set((state) => ({
          step1: { ...state.step1, isEditMode: isEdit, jobPostingId }
        })),
      
      // Step 2 액션들
      setStep2Data: (data) =>
        set((state) => ({
          step2: { ...state.step2, ...data }
        })),
        
      setSelectedLocation: (location) =>
        set((state) => ({
          step2: { ...state.step2, selectedLocation: location }
        })),
        
      setWorkingHours: (hours) =>
        set((state) => ({
          step2: { ...state.step2, workingHours: hours }
        })),
        
      setWorkingHoursNegotiable: (negotiable) =>
        set((state) => ({
          step2: { ...state.step2, workingHoursNegotiable: negotiable }
        })),
        
      setWorkingDays: (days) =>
        set((state) => ({
          step2: { ...state.step2, workingDays: days }
        })),
        
      setWorkingDaysNegotiable: (negotiable) =>
        set((state) => ({
          step2: { ...state.step2, workingDaysNegotiable: negotiable }
        })),
        
      setSalaryType: (type) =>
        set((state) => ({
          step2: { ...state.step2, salaryType: type }
        })),
        
      setSalaryRange: (range) =>
        set((state) => ({
          step2: { ...state.step2, salaryRange: range }
        })),
        
      setSalaryRangeNegotiable: (negotiable) =>
        set((state) => ({
          step2: { ...state.step2, salaryRangeNegotiable: negotiable }
        })),
        
      setPayDay: (day) =>
        set((state) => ({
          step2: { ...state.step2, payDay: day }
        })),
        
      setPayDayNegotiable: (negotiable) =>
        set((state) => ({
          step2: { ...state.step2, payDayNegotiable: negotiable }
        })),
      
      // Step 3 액션들
      setStep3Data: (data) =>
        set((state) => ({
          step3: { ...state.step3, ...data }
        })),
        
      setSelectedCountries: (countries) =>
        set((state) => ({
          step3: { ...state.step3, selectedCountries: countries }
        })),
        
      setSelectedJobs: (jobs) =>
        set((state) => ({
          step3: { ...state.step3, selectedJobs: jobs }
        })),
        
      setSelectedConditions: (conditions) =>
        set((state) => ({
          step3: { ...state.step3, selectedConditions: conditions }
        })),
        
      setSelectedAgeRanges: (ages) =>
        set((state) => ({
          step3: { ...state.step3, selectedAgeRanges: ages }
        })),
        
      setSelectedGenders: (genders) =>
        set((state) => ({
          step3: { ...state.step3, selectedGenders: genders }
        })),
        
      setSelectedVisas: (visas) =>
        set((state) => ({
          step3: { ...state.step3, selectedVisas: visas }
        })),
        
      setSelectedKoreanLevels: (levels) =>
        set((state) => ({
          step3: { ...state.step3, selectedKoreanLevels: levels }
        })),
        
      setIsPostingActive: (active) =>
        set((state) => ({
          step3: { ...state.step3, isPostingActive: active }
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
      
      // 데이터가 비어있는지 확인 (편집 모드가 아닐 때만)
      isDataEmpty: () => {
        const state = get()
        
        // 편집 모드라면 데이터 초기화를 하지 않음
        if (state.step1.isEditMode) {
          return true
        }
        
        // Step 1 데이터 확인
        const step1HasData = state.step1.jobTitle.trim() !== '' ||
                           state.step1.jobDescription.trim() !== '' ||
                           state.step1.jobAddress.trim() !== '' ||
                           state.step1.interviewLocation.trim() !== '' ||
                           state.step1.specialNotes.trim() !== ''
        
        // Step 2 데이터 확인
        const step2HasData = state.step2.selectedLocation !== null ||
                           state.step2.workingHours.trim() !== '' ||
                           state.step2.workingDays.length > 0 ||
                           state.step2.salaryRange.trim() !== '' ||
                           state.step2.payDay.trim() !== ''
        
        // Step 3 데이터 확인
        const step3HasData = state.step3.selectedCountries.length > 0 ||
                           state.step3.selectedJobs.length > 0 ||
                           state.step3.selectedConditions.length > 0 ||
                           state.step3.selectedAgeRanges.length > 0 ||
                           state.step3.selectedGenders.length > 0 ||
                           state.step3.selectedVisas.length > 0 ||
                           state.step3.selectedKoreanLevels.length > 0
        
        return !step1HasData && !step2HasData && !step3HasData
      },
      
      // 데이터 초기화 확인 (React Native Alert는 여기서 직접 사용하지 않고 컴포넌트에서 처리)
      confirmReset: async () => {
        return new Promise((resolve) => {
          // 이 함수는 컴포넌트에서 모달을 표시한 후 결과를 받아서 처리할 예정
          resolve(true)
        })
      },
    }),
    {
      name: 'job-posting-draft',
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
      // 모든 데이터를 persist (편집 모드 정보도 포함)
      partialize: (state) => ({
        step1: state.step1,
        step2: state.step2,
        step3: state.step3
      })
    }
  )
)
// 편의 함수들
export const useStep1Data = () => useJobPostingStore((state) => state.step1)
export const useStep2Data = () => useJobPostingStore((state) => state.step2)
export const useStep3Data = () => useJobPostingStore((state) => state.step3)