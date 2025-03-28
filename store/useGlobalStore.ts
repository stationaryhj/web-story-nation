import { ChatModeData, CoinData, LoginResponse, InquiryData, BankData } from '@/types/api'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'

// 싱글톤 queryClient 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1시간 동안 데이터를 신선하게 유지
      gcTime: 1000 * 60 * 60 * 24, // 24시간 동안 데이터 캐싱
      retry: 1, // 실패시 1번 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스시 자동 리페치 비활성화
    },
  },
})

// ViewTerms
interface TermsStore {
  termsUrls: {
    [key: number]: string;
  };
  isLoading: boolean;
  error: Error | null;
  
  // 약관 URL 가져오기 (캐시된 것이 있으면 재사용)
  getTermsUrl: (termsType: number) => Promise<string>;
  
  // 모든 약관 URL 초기화 (필요 시 사용)
  initializeAllTerms: () => Promise<void>;
  
  // 특정 약관 URL 강제로 다시 가져오기
  refreshTermsUrl: (termsType: number) => Promise<string>;
}

export const useTermsStore = create<TermsStore>()(
  persist(
    (set, get) => ({
      termsUrls: {},
      isLoading: false,
      error: null,
      
      // 약관 URL 가져오기
      getTermsUrl: async (termsType: number) => {
        // 이미 저장된 URL이 있으면 바로 반환
        const existingUrl = get().termsUrls[termsType];
        if (existingUrl) {
          return existingUrl;
        }
        
        // 저장된 URL이 없으면 API 호출
        set({ isLoading: true, error: null });
        
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ['termsUrl', termsType],
            queryFn: async () => {
              const response = await contentApi.ViewTerms(0, 'KR', 1, termsType);
              return response?.data;
            },
            staleTime: Infinity // 한번 가져온 후에는 무효화 안됨
          });
          
          if (data && data.URL) {
            // 성공적으로 URL을 가져왔을 때
            const newUrls = { ...get().termsUrls, [termsType]: data.URL };
            set({ termsUrls: newUrls, isLoading: false });
            return data.URL;
          } else {
            // 응답이 올바르지 않을 때
            const error = new Error('약관 URL을 가져오지 못했습니다');
            set({ isLoading: false, error });
            throw error;
          }
        } catch (error) {
          console.error("약관 URL 로딩 중 오류 발생:", error);
          set({ isLoading: false, error: error as Error });
          throw error;
        }
      },
      
      // 모든 약관 URL 초기화 (이용약관, 개인정보처리방침, 유료이용약관, 운영정책)
      initializeAllTerms: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // 모든 약관 타입에 대해 병렬로 요청
          const termsTypes = [0, 1, 2, 3]; // 이용약관, 유료이용약관, 개인정보처리방침, 운영정책
          const promises = termsTypes.map(type => 
            contentApi.ViewTerms(0, 'KR', 1, type).then(response => ({ 
              type, 
              url: response?.data?.URL 
            }))
          );
          
          const results = await Promise.all(promises);
          
          // 결과를 객체로 변환
          const newUrls = results.reduce((acc, { type, url }) => {
            if (url) {
              acc[type] = url;
            }
            return acc;
          }, { ...get().termsUrls });
          
          set({ termsUrls: newUrls, isLoading: false });
        } catch (error) {
          console.error("약관 URL 일괄 로딩 중 오류 발생:", error);
          set({ isLoading: false, error: error as Error });
        }
      },
      
      // 특정 약관 URL 강제로 다시 가져오기
      refreshTermsUrl: async (termsType: number) => {
        set({ isLoading: true, error: null });
        
        try {
          // 캐시 무효화
          await queryClient.invalidateQueries({ queryKey: ['termsUrl', termsType] });
          
          // 새로 요청
          const response = await contentApi.ViewTerms(0, 'KR', 1, termsType);
          const data = response?.data;
          
          if (data && data.URL) {
            // 성공적으로 URL을 가져왔을 때
            const newUrls = { ...get().termsUrls, [termsType]: data.URL };
            set({ termsUrls: newUrls, isLoading: false });
            return data.URL;
          } else {
            // 응답이 올바르지 않을 때
            const error = new Error('약관 URL을 새로 가져오지 못했습니다');
            set({ isLoading: false, error });
            throw error;
          }
        } catch (error) {
          console.error("약관 URL 새로고침 중 오류 발생:", error);
          set({ isLoading: false, error: error as Error });
          throw error;
        }
      }
    }),
    {
      name: 'terms-storage',
      // 필요한 상태만 저장
      partialize: (state) => ({ termsUrls: state.termsUrls }),
    }
  )
)

// 은행 리스트 Store
interface BankStore {
  bankList: BankData[];
  isLoading: boolean;
  error: Error | null;
  
  // 은행 리스트 가져오기 (캐시된 것이 있으면 재사용)
  getBankList: () => Promise<BankData[]>;
  
  // 은행 리스트 강제로 다시 가져오기
  refreshBankList: () => Promise<BankData[]>;
}

export const useBankStore = create<BankStore>()(
  persist(
    (set, get) => ({
      bankList: [],
      isLoading: false,
      error: null,
      
      // 은행 리스트 가져오기
      getBankList: async () => {
        // 이미 저장된 은행 리스트가 있으면 바로 반환
        const existingBankList = get().bankList;
        if (existingBankList && existingBankList.length > 0) {
          return existingBankList;
        }
        
        // 저장된 은행 리스트가 없으면 API 호출
        set({ isLoading: true, error: null });
        
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ['bankList'],
            queryFn: async () => {
              const response = await contentApi.GetBankList();
              return response?.data;
            },
            staleTime: Infinity // 한번 가져온 후에는 무효화 안됨
          });
          
          if (data && data.bank_list) {
            // 성공적으로 은행 리스트를 가져왔을 때
            set({ bankList: data.bank_list, isLoading: false });
            return data.bank_list;
          } else {
            // 응답이 올바르지 않을 때
            const error = new Error('은행 리스트를 가져오지 못했습니다');
            set({ isLoading: false, error });
            throw error;
          }
        } catch (error) {
          console.error("은행 리스트 로딩 중 오류 발생:", error);
          set({ isLoading: false, error: error as Error });
          throw error;
        }
      },
      
      // 은행 리스트 강제로 다시 가져오기
      refreshBankList: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // 캐시 무효화
          await queryClient.invalidateQueries({ queryKey: ['bankList'] });
          
          // 새로 요청
          const response = await contentApi.GetBankList();
          const data = response?.data;
          
          if (data && data.bank_list) {
            // 성공적으로 은행 리스트를 가져왔을 때
            set({ bankList: data.bank_list, isLoading: false });
            return data.bank_list;
          } else {
            // 응답이 올바르지 않을 때
            const error = new Error('은행 리스트를 새로 가져오지 못했습니다');
            set({ isLoading: false, error });
            throw error;
          }
        } catch (error) {
          console.error("은행 리스트 새로고침 중 오류 발생:", error);
          set({ isLoading: false, error: error as Error });
          throw error;
        }
      }
    }),
    {
      name: 'bank-storage',
      // 필요한 상태만 저장
      partialize: (state) => ({ bankList: state.bankList }),
    }
  )
)

