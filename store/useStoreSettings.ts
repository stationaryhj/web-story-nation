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
// [2026-07-15] 전역 세이프티 필터 강제 OFF 정책(docs/plan/plan-20260715-remove-safety-filter.md,
// docs/q&a/qa-20260715-remove-safety-filter.md Q1 안 1 채택)에 따라 isAdultModeEnabled는 항상 true로 잠금.
export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      settings: defaultSettings,
      isAdultModeEnabled: true,

      // 세이프티 필터 전역 OFF 잠금: 파라미터(서버 safety 값) 무시, 항상 true 유지
      setAdlultMode: (_isAdultModeValue: number) => {
        set({ isAdultModeEnabled: true })
      },

      // 로그인 상태에 따라 성인 모드 활성화 처리
      enableAdultMode: () => {
        // 테스트를 위해 로그인 체크 임시 비활성화
        set({ isAdultModeEnabled: true })
        return true
      },

      // 세이프티 필터 전역 OFF 잠금: 항상 true 유지로 무력화
      toggleAdultMode: () => {
        set({ isAdultModeEnabled: true })
        return true
      },

      // 세이프티 필터 전역 OFF 잠금: 서버 safety 동기화(updateSafetyMode) 호출 제거, 항상 true 유지
      changeAdultMode: () => {
        set({ isAdultModeEnabled: true })
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      // 레거시 localStorage에 저장된 isAdultModeEnabled:false를 무력화(전역 OFF 잠금)
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        isAdultModeEnabled: true,
      }),
    }
  )
)
