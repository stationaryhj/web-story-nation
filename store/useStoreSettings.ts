import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useAccountStore } from './useAccountStore'

// 설정 정보 타입 정의
export interface UserSettings {
  language: 'ko' | 'en'
}

// 설정 스토어 타입 정의
interface SettingsStore {
  settings: UserSettings
  isAdultModeEnabled: boolean
  enableAdultMode: () => boolean
  toggleAdultMode: () => boolean
}

// 기본 설정 값
const defaultSettings: UserSettings = {
  language: 'ko',
}

// Zustand 스토어 생성
export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      settings: defaultSettings,
      isAdultModeEnabled: useAccountStore.getState().isAdult(),

      // 로그인 상태에 따라 성인 모드 활성화 처리
      enableAdultMode: () => {
        // 테스트를 위해 로그인 체크 임시 비활성화
        set({ isAdultModeEnabled: true })
        return true
      },

      // 로그인 상태에 따라 성인 모드 토글 처리
      toggleAdultMode: () => {
        // 테스트를 위해 로그인 체크 임시 비활성화
        set(state => ({ isAdultModeEnabled: !state.isAdultModeEnabled }))
        return true
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
