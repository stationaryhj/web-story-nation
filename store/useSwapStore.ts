// store/useSwapStore.ts
import { TokenInfo } from '@/services/api/types/token'
import { create } from 'zustand'

// 토큰
export interface Token {
  symbol: string
  name: string
  balance: string
  price: string
  amount?: string
  address: string
  icon: string
}

// 스왑 견적 결과
export interface MtrPair {
  handler: string
  handler_name: string
  amount_out: string
  price_out: string
  network_fee: string
  route: string[]
  erc20: {
    icon: string
  }
} 

interface SwapState {
  // 선택된 토큰
  selectedTokens: {
    from: Token | null
    to: Token | null
  }
  // 스왑 견적 결과
  estimateResult: MtrPair[]
  // 선택된 프로바이더
  selectedProvider: MtrPair | null
  // 로딩 상태
  isLoading: boolean
  // 에러
  error: string | null
  
  // Mutation 상태
  mutationStatus: 'idle' | 'pending' | 'error' | 'success'
  tokenList: TokenInfo[] // 추가
  // actions - 순수하게 상태 업데이트만 하는 액션들
  setFromToken: (token: Token) => void
  setToToken: (token: Token) => void
  setFromAmount: (amount: string) => void
  swapTokens: () => void
  setEstimateResult: (result: MtrPair[]) => void
  setSelectedProvider: (provider: MtrPair) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
  setMutationStatus: (status: 'idle' | 'pending' | 'error' | 'success') => void
  setTokenList: (tokenList: TokenInfo[]) => void
  setSelectedTokens: (tokens: { from: Token | null; to: Token | null }) => void
}
//  API 통신 데이터의 초기값 처리 및 undefined 에러 방지는 애플리케이션의
//  안정성과 사용자 경험을 향상시키는 데 매우 중요합니다. 위에 제시된 방법
//  들을 조합하여 사용하면, 이러한 문제들을 효과적으로 해결할 수 있습니다.
export const useSwapStore = create<SwapState>((set, get) => ({
  // 초기 상태
  // 기존 상태들...
  tokenList: [],
  mutationStatus: 'idle',
  
  selectedTokens: {
    from: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      balance: '0',
      price: '0',
      address: '0',
      icon: ''
    },
    to: {
      symbol: 'E1',
      name: 'E1',
      balance: '0',
      price: '0', 
      address: '0',
      icon: ''
    }
  },
  estimateResult: [],
  selectedProvider: null,
  isLoading: false,
  error: null,
  setTokenList: (tokens) => set({ tokenList: tokens }),
  // 액션들 - 순수 상태 업데이트만 수행
  setFromToken: (token) => set(state => ({
    selectedTokens: {
      ...state.selectedTokens,
      from: token
    }
  })),
  // to 토큰 설정
  setToToken: (token) => set(state => ({
    selectedTokens: {
      ...state.selectedTokens,
      to: token
    }
  })),
  // from 토큰 금액 설정
  setFromAmount: (amount) => set(state => {
    // amount가 0이거나 빈 문자열이면 관련 상태 모두 초기화
    if (!amount || amount === '0') {
      return {
        selectedTokens: {
          ...state.selectedTokens,
          from: state.selectedTokens.from ? {
            ...state.selectedTokens.from,
            amount
          } : null,
          to: state.selectedTokens.to ? {
            ...state.selectedTokens.to,
            amount: '0'  // to 토큰 amount도 0으로
          } : null
        },
        selectedProvider: null,  // provider 초기화
        estimateResult: []  // 견적 결과도 비우기
      }
    }

    // 그 외의 경우는 기존처럼 동작
    return {
      selectedTokens: {
        ...state.selectedTokens,
        from: state.selectedTokens.from ? {
          ...state.selectedTokens.from,
          amount
        } : null
      }
    }
  }),
  // 스왑 토큰 교환
  swapTokens: () => set(state => ({
    selectedTokens: {
      from: state.selectedTokens.to,
      to: state.selectedTokens.from
    }
  })),
  // 스왑 견적 결과 설정
  setEstimateResult: (result) => set({ estimateResult: result }),
  //선택한 프로바이더 설정
  setSelectedProvider: (provider) => {
    set({ selectedProvider: provider })
    set(state => ({
      selectedTokens: {
        ...state.selectedTokens,
        to: state.selectedTokens.to ? {
          ...state.selectedTokens.to,
          amount: provider.amount_out,
          price: provider.price_out
        } : null
      }
    }))
  },
  setMutationStatus: (status) => set({ mutationStatus: status }),
  setSelectedTokens: (tokens) => set({ selectedTokens: tokens }),
  // 에러 설정
  setError: (error) => set({ error }),
  // 로딩 상태 설정
  setLoading: (isLoading) => set({ isLoading })
}))