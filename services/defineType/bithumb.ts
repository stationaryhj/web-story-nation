import type { UTCTimestamp } from 'lightweight-charts';

// API 응답 타입
export interface BithumbCandle {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  unit: number;
}

// 차트 데이터 타입
export interface ChartCandle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

// 웹소켓 응답 타입
export interface BithumbTickerData {
  volumePower: string;
  chgAmt: string;
  chgRate: string;
  prevClosePrice: string;
  buyVolume: string;
  sellVolume: string;
  volume: string;
  value: string;
  highPrice: string;
  lowPrice: string;
  closePrice: string;
  openPrice: string;
  time: string;
  date: string;
  tickType: string;
  symbol: string;
}

export interface BithumbTickerMessage {
  type: 'ticker';
  content: BithumbTickerData;
}

export type TickerCallback = (data: BithumbTickerData) => void;
