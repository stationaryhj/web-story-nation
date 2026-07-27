import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 설정 정보 타입 정의
export interface UserSettings {
  language: 'ko' | 'en'
}

// 설정 스토어 타입 정의
interface SettingsStore {
  settings: UserSettings
  isAdultModeEnabled: boolean
  setAdlultMode: (isAdultModeValue: number) => void
  enableAdultMode: () => boolean
  toggleAdultMode: () => boolean
  changeAdultMode: () => void
}

// 기본 설정 값
const defaultSettings: UserSettings = {
  language: 'ko',
}

// Zustand 스토어 생성
// [2026-07-27] 전역 세이프티 필터 강제 ON 정책(API safety: 1 고정)에 따라
// isAdultModeEnabled는 항상 false로 잠금. (2026-07-15 강제 OFF 정책을 반전)
export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      settings: defaultSettings,
      isAdultModeEnabled: false,

      // 세이프티 필터 전역 ON 잠금: 파라미터(서버 safety 값) 무시, 항상 false 유지
      setAdlultMode: (_isAdultModeValue: number) => {
        set({ isAdultModeEnabled: false })
      },

      // 세이프티 필터 전역 ON 잠금: 성인 모드 활성화 불가, 항상 false 유지
      enableAdultMode: () => {
        set({ isAdultModeEnabled: false })
        return false
      },

      // 세이프티 필터 전역 ON 잠금: 항상 false 유지로 무력화
      toggleAdultMode: () => {
        set({ isAdultModeEnabled: false })
        return false
      },

      // 세이프티 필터 전역 ON 잠금: 서버 safety 동기화(updateSafetyMode) 호출 제거, 항상 false 유지
      changeAdultMode: () => {
        set({ isAdultModeEnabled: false })
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      // 레거시 localStorage에 저장된 isAdultModeEnabled:true를 무력화(전역 ON 잠금)
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        isAdultModeEnabled: false,
      }),
    }
  )
)
