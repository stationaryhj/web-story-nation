// services/api/candleApi.ts
import axios from 'axios'
import { UTCTimestamp } from 'lightweight-charts'
import { CandlePrice } from './types/chart'

// 웹소켓 패킷 타입
interface WsPacket {
  header: string
  wallet_address?: string
  ab_token?: string
  pair?: string
  interval?: number
  data?: any
}

// 캔들 데이터 응답 타입
export interface CandleResponse {  // export 추가
  chain_id: string
  ab_token: string
  pair: string
  timestamp: number
  interval: number
  price: CandlePrice[]
  tx_count: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const API_URL = 'http://192.168.0.163:9090/api'
const API_URL_WS = 'ws://192.168.0.163:9090'
let ws: WebSocket | null = null
let subscribers: ((data: CandleResponse) => void)[] = []
let connectPromise: Promise<void> | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 1000

// 차트 데이터로 변환
const transformCandleData = (candle: CandleResponse): any => {
  return {
    time: candle.timestamp as UTCTimestamp,
    open: Number(candle.price[0].open),
    high: Number(candle.price[0].high),
    low: Number(candle.price[0].low),
    close: Number(candle.price[0].close),
    volume: Number(candle.price[0].target_vol)
  }
}

export const candleApi = {
  // REST API: 초기 캔들 데이터 조회
  getCandles: async (
    pair: string,
    interval: number,
    ts?: number | null,
    limit: number = 100
  ): Promise<ApiResponse<CandleResponse[]>> => {
    try {
      // URLSearchParams 객체 생성
    const params = new URLSearchParams()
    
    params.append('pair', pair)
    params.append('interval', interval.toString()) // 변경
    if (ts) {
    params.append('ts', ts.toString()) // 변경
    }
    params.append('limit', limit.toString()) // 변경
    const requestUrl = `${API_URL}/candles?${params}`
    console.log('요청 URL:', requestUrl)
    const response = await axios.get<ApiResponse<CandleResponse[]>>(
      requestUrl
    )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API 에러 상세:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        })
      }
      console.error('캔들 데이터 조회 실패:', error)
      throw error
    }
  },

  // 웹소켓 연결 (Promise 반환)
  connectWebSocket: async () => {
    if (ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }
    if (connectPromise) {
      return connectPromise
    }

    connectPromise = new Promise((resolve, reject) => {
      ws = new WebSocket(`${API_URL_WS.replace('http', 'ws')}/ws/connect`)

      ws.onopen = () => {
        console.log('웹소켓 연결됨')
        reconnectAttempts = 0
        resolve()
      }

      ws.onmessage = (event) => {
        try {
          const packet: WsPacket = JSON.parse(event.data)
          
          if (packet.header === 'candles' && packet.data) {
            const candleData = packet.data as CandleResponse
            subscribers.forEach(callback => callback(candleData))
          }
        } catch (error) {
          console.error('웹소켓 메시지 파싱 실패:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('웹소켓 에러:', error)
        reject(error)
      }

      ws.onclose = () => {
        console.log('웹소켓 연결 종료')
        connectPromise = null
        
        // 재연결 시도
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          setTimeout(() => {
            candleApi.connectWebSocket()
          }, RECONNECT_DELAY * reconnectAttempts)
        }
      }
    })

    return connectPromise
  },

  // 실시간 차트 구독 (비동기로 변경)
  subscribeToChart: async (pair: string, interval: number) => {
    // 연결이 안 되어 있으면 연결
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      await candleApi.connectWebSocket()
    }

    const packet: WsPacket = {
      header: 'target_pair',
      interval,
      pair
    }

    ws?.send(JSON.stringify(packet))
  },

  // 실시간 데이터 구독
  subscribe: (callback: (data: CandleResponse) => void) => {
    subscribers.push(callback)
    console.log(subscribers,'구독 하고있는지?')
    return () => {
      subscribers = subscribers.filter(cb => cb !== callback)
    }
  },

  // 웹소켓 연결 해제
  disconnect: () => {
    if (ws) {
      ws.close()
      ws = null
      subscribers = []
      connectPromise = null
      reconnectAttempts = 0
    }
  },

  // 데이터 변환 유틸리티
  utils: {
    transformCandleData,
    // 캔들 데이터 정렬
    sortCandles: (candles: CandleResponse[]): CandleResponse[] => {
      return [...candles].sort((a, b) => a.timestamp - b.timestamp)
    }
  }
}