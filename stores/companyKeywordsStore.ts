import { create } from 'zustand'
// 키워드 타입
interface Keyword {
  id: number
  keyword: string
  category: string
}
// Step 1: 사업장위치, 모집직종
interface Step1Data {
  location: number | null
  jobs: number[]
}
// Step 2: 국가, 성별, 나이대, 비자
interface Step2Data {
  countries: number[]
  genders: number[]
  ages: number[]
  visas: number[]
}
// Step 3: 한국어수준, 근무요일
interface Step3Data {
  koreanLevel: number | null
  workDays: number[]
  isWorkDaysSelectLater: boolean
}
// 전체 스토어 타입
interface CompanyKeywordsStore {
  // 데이터
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  
  // Step 1 액션들
  setStep1Data: (data: Partial<Step1Data>) => void
  setLocation: (location: number | null) => void
  setJobs: (jobs: number[]) => void
  toggleJob: (jobId: number) => void
  
  // Step 2 액션들
  setStep2Data: (data: Partial<Step2Data>) => void
  setCountries: (countries: number[]) => void
  setGenders: (genders: number[]) => void
  setAges: (ages: number[]) => void
  setVisas: (visas: number[]) => void
  addCountry: (countryId: number) => void
  removeCountry: (countryId: number) => void
  addGender: (genderId: number) => void
  removeGender: (genderId: number) => void
  addAge: (ageId: number) => void
  removeAge: (ageId: number) => void
  addVisa: (visaId: number) => void
  removeVisa: (visaId: number) => void
  clearCountries: () => void
  clearGenders: () => void
  clearAges: () => void
  clearVisas: () => void
  
  // Step 3 액션들
  setStep3Data: (data: Partial<Step3Data>) => void
  setKoreanLevel: (level: number | null) => void
  setWorkDays: (workDays: number[]) => void
  toggleWorkDay: (workDayId: number) => void
  setWorkDaysSelectLater: (isSelectLater: boolean) => void
  setAllWorkDays: (allWorkDayIds: number[]) => void
  clearWorkDays: () => void
  
  // 유틸리티 액션들
  resetAllData: () => void
  getCurrentStep1Data: () => Step1Data
  getCurrentStep2Data: () => Step2Data
  getCurrentStep3Data: () => Step3Data
  getAllSelectedKeywords: () => number[]
  setInitialData: (keywordIds: number[], keywords: Keyword[]) => void
}
// 초기 상태
const initialStep1: Step1Data = {
  location: null,
  jobs: []
}
const initialStep2: Step2Data = {
  countries: [],
  genders: [],
  ages: [],
  visas: []
}
const initialStep3: Step3Data = {
  koreanLevel: null,
  workDays: [],
  isWorkDaysSelectLater: false
}
// Zustand Store 생성 (AsyncStorage 없이)
export const useCompanyKeywordsStore = create<CompanyKeywordsStore>()(
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
        
      setLocation: (location) =>
        set((state) => ({
          step1: { ...state.step1, location }
        })),
        
      setJobs: (jobs) =>
        set((state) => ({
          step1: { ...state.step1, jobs }
        })),
        
      toggleJob: (jobId) =>
        set((state) => ({
          step1: {
            ...state.step1,
            jobs: state.step1.jobs.includes(jobId)
              ? state.step1.jobs.filter(id => id !== jobId)
              : [...state.step1.jobs, jobId]
          }
        })),
      
      // Step 2 액션들
      setStep2Data: (data) =>
        set((state) => ({
          step2: { ...state.step2, ...data }
        })),
        
      setCountries: (countries) =>
        set((state) => ({
          step2: { ...state.step2, countries }
        })),
        
      setGenders: (genders) =>
        set((state) => ({
          step2: { ...state.step2, genders }
        })),
        
      setAges: (ages) =>
        set((state) => ({
          step2: { ...state.step2, ages }
        })),
        
      setVisas: (visas) =>
        set((state) => ({
          step2: { ...state.step2, visas }
        })),
        
      addCountry: (countryId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            countries: state.step2.countries.includes(countryId)
              ? state.step2.countries
              : [...state.step2.countries, countryId]
          }
        })),
        
      removeCountry: (countryId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            countries: state.step2.countries.filter(id => id !== countryId)
          }
        })),
        
      addGender: (genderId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            genders: state.step2.genders.includes(genderId)
              ? state.step2.genders
              : [...state.step2.genders, genderId]
          }
        })),
        
      removeGender: (genderId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            genders: state.step2.genders.filter(id => id !== genderId)
          }
        })),
        
      addAge: (ageId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            ages: state.step2.ages.includes(ageId)
              ? state.step2.ages
              : [...state.step2.ages, ageId]
          }
        })),
        
      removeAge: (ageId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            ages: state.step2.ages.filter(id => id !== ageId)
          }
        })),
        
      addVisa: (visaId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            visas: state.step2.visas.includes(visaId)
              ? state.step2.visas
              : [...state.step2.visas, visaId]
          }
        })),
        
      removeVisa: (visaId) =>
        set((state) => ({
          step2: {
            ...state.step2,
            visas: state.step2.visas.filter(id => id !== visaId)
          }
        })),
        
      clearCountries: () =>
        set((state) => ({
          step2: { ...state.step2, countries: [] }
        })),
        
      clearGenders: () =>
        set((state) => ({
          step2: { ...state.step2, genders: [] }
        })),
        
      clearAges: () =>
        set((state) => ({
          step2: { ...state.step2, ages: [] }
        })),
        
      clearVisas: () =>
        set((state) => ({
          step2: { ...state.step2, visas: [] }
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
        
      setWorkDays: (workDays) =>
        set((state) => ({
          step3: { ...state.step3, workDays }
        })),
        
      toggleWorkDay: (workDayId) =>
        set((state) => ({
          step3: {
            ...state.step3,
            workDays: state.step3.workDays.includes(workDayId)
              ? state.step3.workDays.filter(id => id !== workDayId)
              : [...state.step3.workDays, workDayId]
          }
        })),
        
      setWorkDaysSelectLater: (isSelectLater) =>
        set((state) => ({
          step3: { ...state.step3, isWorkDaysSelectLater: isSelectLater }
        })),
        
      setAllWorkDays: (allWorkDayIds) =>
        set((state) => ({
          step3: { 
            ...state.step3, 
            workDays: allWorkDayIds,
            isWorkDaysSelectLater: false 
          }
        })),
        
      clearWorkDays: () =>
        set((state) => ({
          step3: { 
            ...state.step3, 
            workDays: [],
            isWorkDaysSelectLater: true 
          }
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
      
      // 모든 선택된 키워드들을 배열로 반환
      getAllSelectedKeywords: () => {
        const state = get()
        return [
          state.step1.location,
          ...state.step1.jobs,
          ...state.step2.countries,
          ...state.step2.genders,
          ...state.step2.ages,
          ...state.step2.visas,
          state.step3.koreanLevel,
          ...state.step3.workDays
        ].filter(Boolean) as number[]
      },
      
      // 초기 데이터 설정 (DB에서 불러온 키워드)
      setInitialData: (keywordIds, keywords) => {
        const newState = {
          step1: { ...initialStep1 },
          step2: { ...initialStep2 },
          step3: { ...initialStep3 }
        }
        
        keywordIds.forEach(keywordId => {
          const keyword = keywords.find(k => k.id === keywordId)
          if (!keyword) return
          
          switch (keyword.category) {
            case '지역':
              newState.step1.location = keywordId
              break
            case '직종':
              newState.step1.jobs.push(keywordId)
              break
            case '국가':
              if (keyword.keyword !== '상관없음') {
                newState.step2.countries.push(keywordId)
              }
              break
            case '성별':
              if (keyword.keyword !== '상관없음') {
                newState.step2.genders.push(keywordId)
              }
              break
            case '나이대':
              if (keyword.keyword !== '상관없음') {
                newState.step2.ages.push(keywordId)
              }
              break
            case '비자':
              if (keyword.keyword !== '상관없음') {
                newState.step2.visas.push(keywordId)
              }
              break
            case '한국어수준':
              if (keyword.keyword !== '상관없음') {
                newState.step3.koreanLevel = keywordId
              }
              break
            case '근무요일':
              newState.step3.workDays.push(keywordId)
              break
          }
        })
        
        set(newState)
      }
    })
)
// 편의 함수들
export const useStep1KeywordsData = () => useCompanyKeywordsStore((state) => state.step1)
export const useStep2KeywordsData = () => useCompanyKeywordsStore((state) => state.step2)
export const useStep3KeywordsData = () => useCompanyKeywordsStore((state) => state.step3)