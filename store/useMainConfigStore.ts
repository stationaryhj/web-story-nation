// store/useMainConfigStore.ts - 전체 코드
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getWebConfig, getWebNotice } from '@/services/api/storyNationApi'
import { PromotionItem } from '@/types/provider'

// 서버 설정 데이터 타입 정의
interface WebConfig {
  ispm: boolean
  pm_period: string
  pm_utc_start: string
  pm_utc_end: string
  pm_desc: string
  pm_desc_ko: string
}

// 웹 공지 데이터 타입 정의
interface WebNotice {
  promotions: {
    data: PromotionItem[]
  }
  config: {
    isCheckBeforeWithdraw: boolean
    isShowEnergy: boolean
    isShowAds: boolean
    isShowAdsAllReward: boolean
    isShowAdsGoogleReward: boolean
    isShowAdsUnityReward: boolean
    isShowAdsGoogleNative: boolean
    isShowAdsUnityNative: boolean
    isUnityTestAds: boolean
    isGoogleTestAds: boolean
    isUseGooglePlayGamesLogin: boolean
    isUseFacebookLogin: boolean
    firebaseTopicAdditionCode: number
    er_ai: number
    crt_ai: number
    ai_image_cost: number
    ai_image_cost_free: number
    ai_image_cost_retry: number
    ai_image_cost_retry_free: number
    homeTabVisibility: number
  }
}

// 스토어 인터페이스 정의
interface MainConfigStore {
  // 상태
  webConfig: WebConfig | null
  webNotice: WebNotice | null
  activeNotices: PromotionItem[]
  isLoading: boolean
  error: string | null
  
  // 액션
  fetchWebConfig: () => Promise<void>
  fetchWebNotice: () => Promise<void>
  fetchAllConfig: () => Promise<void>
  getActiveNotices: () => PromotionItem[]
  markNoticeAsShown: (key: number) => void
  markNoticeHiddenForToday: (key: number) => void
  isNoticeHidden: (key: number) => boolean

  closeNotice: (key: number) => void
}

// Zustand 스토어 생성 - persist 미들웨어 적용
export const useMainConfigStore = create<MainConfigStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      webConfig: null,
      webNotice: null,
      activeNotices: [],
      isLoading: false,
      error: null,

      // WebConfig 데이터 가져오기
      fetchWebConfig: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await getWebConfig()
          
          if (response.data) {
            set({ webConfig: response.data, isLoading: false })
          } else {
            set({ error: '서버 상태 정보를 불러오는데 실패했습니다.', isLoading: false })
          }
        } catch (error) {
          console.error('웹 설정 로드 오류:', error)
          set({ 
            error: error instanceof Error ? error.message : '서버 상태 정보를 불러오는데 실패했습니다.', 
            isLoading: false 
          })
        }
      },

      // WebNotice 데이터 가져오기
      fetchWebNotice: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await getWebNotice()
          
          if (response.data) {
            const webNotice = response.data
            
            // is_show가 true이고, 오늘 하루 보지 않기로 설정되지 않은 항목만 필터링
            const activeNotices = webNotice.promotions.data
              .filter((item: PromotionItem) => item.is_show)
              .filter((item: PromotionItem) => !get().isNoticeHidden(item.key))
            
            set({ 
              webNotice, 
              activeNotices,
              isLoading: false 
            })
          } else {
            set({ error: '공지사항을 불러오는데 실패했습니다.', isLoading: false })
          }
        } catch (error) {
          console.error('웹 공지 로드 오류:', error)
          set({ 
            error: error instanceof Error ? error.message : '공지사항을 불러오는데 실패했습니다.', 
            isLoading: false 
          })
        }
      },

      // 모든 설정 한번에 가져오기
      fetchAllConfig: async () => {
        set({ isLoading: true, error: null })
        try {
          await Promise.all([
            get().fetchWebConfig(),
            get().fetchWebNotice()
          ])
        } catch (error) {
          console.error('설정 로드 오류:', error)
          set({ 
            error: error instanceof Error ? error.message : '설정을 불러오는데 실패했습니다.', 
            isLoading: false 
          })
        }
      },

      // 활성화된 공지사항 가져오기
      getActiveNotices: () => {
        return get().activeNotices
      },

      closeNotice: (key: number) => {
        set(state => ({
            ...state,
            activeNotices: state.activeNotices.filter(item => item.key !== key)
          }))
      },

      // 공지사항 표시 여부 확인 함수
      isNoticeHidden: (key: number): boolean => {
        const hiddenUntil = localStorage.getItem(`notice_hidden_${key}`)
        
        if (hiddenUntil) {
          const hiddenUntilTime = parseInt(hiddenUntil)
          const now = new Date().getTime()
          
          // 숨김 기간이 지나지 않았으면 true 반환
          return now < hiddenUntilTime
        }
        
        return false
      },

      // 공지사항 숨김 처리 함수
      markNoticeHiddenForToday: (key: number) => {
        // 오늘 자정까지 유효시간 계산
        const tomorrow = new Date()
        tomorrow.setHours(24, 0, 0, 0)
        
        // localStorage에 저장
        localStorage.setItem(`notice_hidden_${key}`, tomorrow.getTime().toString())
        
        // 현재 activeNotices에서 해당 key의 공지 제거
        set(state => ({
          ...state,
          activeNotices: state.activeNotices.filter(item => item.key !== key)
        }))
      },

      // 특정 공지사항을 보여줬음을 표시 (localStorage에 저장)
      markNoticeAsShown: (key: number) => {
        const noticeKey = `notice_shown_${key}`
        localStorage.setItem(noticeKey, 'true')
      }
    }),
    {
      name: 'config-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // activeNotices는 persist하지 않음 - 매번 서버에서 최신 데이터를 fetch
        webConfig: state.webConfig,
        webNotice: state.webNotice
      })
    }
  )
)