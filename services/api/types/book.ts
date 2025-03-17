// services/api/types/book.ts
export interface MtrToken {
  chain_id: string
  address: string
  name: string
  symbol: string
  decimals: number
  icon: string
  reserve_amount?: string
}

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

export interface fairInfo {
  rate: string
  network_fee : string
  estimated_time:string
  minimum_received:string
  slippage: string[]
  select_liquidity:string[]
  service_fee:string  
  }

export interface EstimateAmountOutResponse {
  data: MtrPair[]
}

// services/api/types/token.ts
export interface Token {
  symbol: string
  name: string
  balance: string
  price: string
  amount?: string
  address: string
}

// store/types/swap.ts
export interface SwapState {
  // UI 상태
  selectedTokens: {
    from: Token | null
    to: Token | null
  }
  estimateResult: MtrPair[]
  selectedProvider: MtrPair | null
  
  // 로딩/에러 상태
  isLoading: boolean
  error: string | null

  // Mutation 상태



  // 액션
  setFromToken: (token: Token) => void
  setToToken: (token: Token) => void
  setFromAmount: (amount: string) => void
  swapTokens: () => void
  setEstimateResult: (result: MtrPair[]) => void
  setSelectedProvider: (provider: MtrPair) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
}