import axios from 'axios'
import { UTCTimestamp } from 'lightweight-charts'
import { BithumbCandle, BithumbTickerData, ChartCandle } from '@/services/defineType/bithumb'
import { convertTickerToUTCTimestamp } from '../ws/bithumbTicker'

const BITHUMB_API_URL = 'https://api.bithumb.com/v1/candles'

// KST 기준 날짜 문자열 생성 함수
const formatToKST = (timestamp: number): string => {
  // UTC 타임스탬프를 Date 객체로 변환
  const date = new Date(timestamp * 1000)
  // KST(UTC+9) 적용
  const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000))
  // yyyy-MM-dd'T'HH:mm:ss 형식으로 포맷팅
  return kstDate.toISOString().slice(0, 19)
}

// 빗썸 웹소켓 데이터를 차트 데이터로 변환
export const transformBithumbTickerData = (ticker: BithumbTickerData): ChartCandle => {
  return {
    time: convertTickerToUTCTimestamp(ticker),
    open: Number(ticker.openPrice),
    high: Number(ticker.highPrice),
    low: Number(ticker.lowPrice),
    close: Number(ticker.closePrice),
  }
}

// 빗썸 API 데이터를 차트 데이터로 변환
export const transformCandleData = (candle: BithumbCandle): ChartCandle => {
  const startTime = Math.floor(new Date(candle.candle_date_time_kst).getTime() / 1000)
  
  return {
    time: startTime as UTCTimestamp,
    open: candle.opening_price,
    high: candle.high_price,
    low: candle.low_price,
    close: candle.trade_price,
  }
}

// 차트 데이터 정렬
export const sortCandlesByTime = (candles: ChartCandle[]): ChartCandle[] => {
  const uniqueCandles = new Map<number, ChartCandle>()
  
  candles.forEach(candle => {
    uniqueCandles.set(Number(candle.time), candle)
  })

  return Array.from(uniqueCandles.values())
    .sort((a, b) => Number(a.time) - Number(b.time))
}

// 빗썸 API 데이터 가져오기
export const bithumbCryptoApi = {
  /**
   * 빗썸 API에서 캔들스틱 데이터를 가져오는 함수
   * @param unit - 분 단위 (1, 3, 5, 10, 30, 60, 240)
   * @param to - 마지막 캔들의 시간 (exclusive)
   */
  async getCandles(
    unit: string = '30', 
    to?: UTCTimestamp
  ): Promise<BithumbCandle[]> {
    try {
      const response = await axios.get<BithumbCandle[]>(
        `${BITHUMB_API_URL}/minutes/${unit}`,
        {
          params: {
            market: 'KRW-BTC',
            count: 200,
            to: to ? formatToKST(to) : undefined
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Error fetching candles:', error)
      throw error
    }
  }
} 