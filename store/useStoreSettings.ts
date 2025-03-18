import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 은행 리스트
export const BANK_LIST = [
  '국민은행', '신한은행', '우리은행', '하나은행', '농협은행',
  '기업은행', '수협은행', 'SC제일은행', '카카오뱅크', '토스뱅크',
  '케이뱅크', '산업은행', '대구은행', '부산은행', '광주은행', '경남은행',
];

// 설정 정보 타입 정의
export interface UserSettings {
  profile: {
    nickname: string;
    email: string;
    platform: string;
    profileImageUrl: string | null;
  };
  bankAccount: {
    bank: string | null;
    accountNumber: string;
    accountHolder: string;
  };
  language: 'ko' | 'en';
}

// 설정 스토어 타입 정의
interface SettingsStore {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateProfile: (profile: Partial<UserSettings['profile']>) => void;
  updateBankAccount: (bankAccount: Partial<UserSettings['bankAccount']>) => void;
  setLanguage: (language: 'ko' | 'en') => void;
  uploadProfileImage: (imageUrl: string) => void;
  resetSettings: () => void;
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
};

// Zustand 스토어 생성
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,

      updateProfile: (profile) =>
        set((state) => ({
          settings: {
            ...state.settings,
            profile: {
              ...state.settings.profile,
              ...profile,
            },
          },
        })),

      updateBankAccount: (bankAccount) =>
        set((state) => ({
          settings: {
            ...state.settings,
            bankAccount: {
              ...state.settings.bankAccount,
              ...bankAccount,
            },
          },
        })),

      setLanguage: (language) =>
        set((state) => ({
          settings: {
            ...state.settings,
            language,
          },
        })),

      uploadProfileImage: (imageUrl) =>
        set((state) => ({
          settings: {
            ...state.settings,
            profile: {
              ...state.settings.profile,
              profileImageUrl: imageUrl,
            },
          },
        })),

      resetSettings: () =>
        set({ settings: defaultSettings }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
