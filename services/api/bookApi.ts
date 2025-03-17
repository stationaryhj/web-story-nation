import { api } from "./axiosInstance"

interface Order {
  maker: string
  inToken: string
  outToken: string
  amountIn: string
  amountOut: string
  amountOutMin: string
  deadline: number
  makeTime: number
  maxFee: string
}

interface RegisterOrderParams {
  order: Order
  signature: number[]
}

interface CancelOrderParams {
  data: string // sign-data (dominoswap,address,structHash)
}

// 오더북/거래 관련 API
export const bookApi = {
  // 핸들러 리스트 조회
  getHandlers: () => {
    return api.get('/api/book/handlers')
  },

  // 토큰 페어에 대한 Pair 리스트 조회
  getPairs: (tokenA: string, tokenB: string) => {
    return api.get(`/api/book/ab_token/pairs?token_a=${tokenA}&token_b=${tokenB}`)
  },
  
  // 지원하는 오더북 리스트 조회
  getInfoList: () => {
    return api.get('/api/book/info_list')
  },

  // 지정가 예약 리스트 조회
  getLimitOrders: (tokenA: string, tokenB: string) => {
    return api.get(`/api/book/limit_orders?token_a=${tokenA}&token_b=${tokenB}`)
  },

  // 예상 보상량 계산
  estimateAmountOut: (inToken: string, outToken: string, amountIn: string) => {
    return api.get(`/api/book/estimate/amount_out?in_token=${inToken}&out_token=${outToken}&amount_in=${amountIn}`)
  },

  // 지정가 주문 등록
  registerLimitOrder: (params: RegisterOrderParams) => {
    return api.post('/api/book/limit_order/register', params)
  },

  // 지정가 주문 취소
  cancelLimitOrder: (params: CancelOrderParams) => {
    return api.post('/api/book/limit_order/cancel', params)
  },

  // 거래 히스토리 조회
  getOrderHistory: (params: {
    tokenA: string
    tokenB: string
    maker?: string
    kind?: 'register' | 'cancel' | 'trade'
    offset?: number
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('token_a', params.tokenA)
    queryParams.append('token_b', params.tokenB)
    if (params.maker) queryParams.append('maker', params.maker)
    if (params.kind) queryParams.append('kind', params.kind)
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

    return api.get(`/api/book/limit_order/history?${queryParams.toString()}`)
  }
} 
