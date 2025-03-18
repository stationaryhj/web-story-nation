// 시간 단위 옵션
export const TIME_UNITS = [
  { value: '1', label: '1분' },
  { value: '3', label: '3분' },
  { value: '5', label: '5분' },
  { value: '10', label: '10분' },
  { value: '30', label: '30분' },
  { value: '60', label: '1시간' },
  { value: '240', label: '4시간' },
] as const;

// 차트 스타일
export const CHART_STYLES = {
  upColor: '#ef5350', // 상승(양봉) - 빨간색
  downColor: '#2196F3', // 하락(음봉) - 파란색
  wickUpColor: '#ef5350',
  wickDownColor: '#2196F3',
  borderUpColor: '#ef5350',
  borderDownColor: '#2196F3',
} as const;

// 웹소켓 설정
export const WEBSOCKET_CONFIG = {
  url: 'wss://pubwss.bithumb.com/pub/ws',
  reconnectDelay: 1000,
  maxReconnectAttempts: 5,
} as const;

// 웹소켓 구독 메시지
export const SUBSCRIBE_MESSAGE = {
  type: 'ticker',
  symbols: [ 'BTC_KRW' ],
  tickTypes: [ '30M' ],
} as const;
