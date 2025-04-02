import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useModalStore } from './useStoreModal'
import { useAccountStore } from './useAccountStore'

// 은행 리스트
export const BANK_LIST = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '농협은행',
  '기업은행',
  '수협은행',
  'SC제일은행',
  '카카오뱅크',
  '토스뱅크',
  '케이뱅크',
  '산업은행',
  '대구은행',
  '부산은행',
  '광주은행',
  '경남은행',
]

// 설정 정보 타입 정의
export interface UserSettings {
  profile: {
    nickname: string
    email: string
    platform: string
    profileImageUrl: string | null
  }
  bankAccount: {
    bank: string | null
    accountNumber: string
    accountHolder: string
  }
  language: 'ko' | 'en'
}

// 설정 스토어 타입 정의
interface SettingsStore {
  settings: UserSettings
  isLoading: boolean
  error: string | null
  isLoggedIn: boolean
  updateProfile: (profile: Partial<UserSettings['profile']>) => void
  updateBankAccount: (bankAccount: Partial<UserSettings['bankAccount']>) => void
  setLanguage: (language: 'ko' | 'en') => void
  uploadProfileImage: (imageUrl: string) => void
  resetSettings: () => void
  isAdultModeEnabled: boolean
  enableAdultMode: () => boolean
  disableAdultMode: () => void
  toggleAdultMode: () => boolean
  login: (userData: Partial<UserSettings['profile']>) => void
  logout: () => void
}

// 기본 설정 값
const defaultSettings: UserSettings = {
  profile: {
    nickname: 'pika1127',
    email: 'pika1127@naver.com',
    platform: 'Kakao',
    profileImageUrl: '/images/default-profile.jpg',
  },
  bankAccount: {
    bank: null,
    accountNumber: '',
    accountHolder: '',
  },
  language: 'ko',
}

// Zustand 스토어 생성
export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,
      isLoggedIn: false,

      updateProfile: profile =>
        set(state => ({
          settings: {
            ...state.settings,
            profile: {
              ...state.settings.profile,
              ...profile,
            },
          },
        })),

      updateBankAccount: bankAccount =>
        set(state => ({
          settings: {
            ...state.settings,
            bankAccount: {
              ...state.settings.bankAccount,
              ...bankAccount,
            },
          },
        })),

      setLanguage: language =>
        set(state => ({
          settings: {
            ...state.settings,
            language,
          },
        })),

      uploadProfileImage: imageUrl =>
        set(state => ({
          settings: {
            ...state.settings,
            profile: {
              ...state.settings.profile,
              profileImageUrl: imageUrl,
            },
          },
        })),

      resetSettings: () => set({ settings: defaultSettings }),

      isAdultModeEnabled: useAccountStore.getState().isAdult(),

      // 로그인 상태에 따라 성인 모드 활성화 처리
      enableAdultMode: () => {
        // 테스트를 위해 로그인 체크 임시 비활성화
        set({ isAdultModeEnabled: true })
        console.log('enableAdultMode 호출됨 - 상태 변경됨')
        return true

        /* 원래 로직
        let success = false
        set(state => {
          if (state.isLoggedIn) {
            success = true
            return { isAdultModeEnabled: true }
          }
          return state
        })

        if (!success) {
          // 로그인 모달을 열기 위한 함수를 여기서 호출할 수 없으므로 false 반환
          // 이 결과값을 사용하여 호출하는 쪽에서 모달을 열도록 함
        }

        return success
        */
      },

      disableAdultMode: () => set({ isAdultModeEnabled: false }),

      // 로그인 상태에 따라 성인 모드 토글 처리
      toggleAdultMode: () => {
        // 테스트를 위해 로그인 체크 임시 비활성화
        set(state => ({ isAdultModeEnabled: !state.isAdultModeEnabled }))
        return true

        /* 원래 로직
        let success = false
        let currentState = false

        set(state => {
          currentState = state.isAdultModeEnabled

          // 이미 활성화 상태면 비활성화는 항상 가능
          if (state.isAdultModeEnabled) {
            success = true
            return { isAdultModeEnabled: false }
          }

          // 활성화하려는 경우 로그인 상태 확인
          if (state.isLoggedIn) {
            success = true
            return { isAdultModeEnabled: true }
          }

          // 로그인 상태가 아니면 상태 변경 없음
          return state
        })

        // 성공 여부 반환
        return success
        */
      },

      // 로그인 처리
      login: userData =>
        set(state => ({
          isLoggedIn: true,
          settings: {
            ...state.settings,
            profile: {
              ...state.settings.profile,
              ...userData,
            },
          },
        })),

      // 로그아웃 처리
      logout: () =>
        set(state => ({
          isLoggedIn: false,
          isAdultModeEnabled: false, // 로그아웃 시 성인 모드도 자동 비활성화
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
