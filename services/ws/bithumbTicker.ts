import type { UTCTimestamp } from 'lightweight-charts';

import type { BithumbTickerData, BithumbTickerMessage, TickerCallback } from '../defineType/bithumb';

class BithumbWebSocket {
  private ws: WebSocket | null = null;
  private subscribers: Set<TickerCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1초

  connect() {
    try {
      this.ws = new WebSocket('wss://pubwss.bithumb.com/pub/ws');

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
        // 구독 메시지 전송
        this.subscribe();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as BithumbTickerMessage;
          if (message.type === 'ticker') {
            this.notifySubscribers(message.content);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${ this.reconnectAttempts }/${ this.maxReconnectAttempts })`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private subscribe() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'ticker',
        symbols: [ 'BTC_KRW' ],
        tickTypes: [ '30M' ],
      };
      this.ws.send(JSON.stringify(subscribeMessage));
    }
  }

  addSubscriber(callback: TickerCallback) {
    this.subscribers.add(callback);
    // 첫 구독자가 추가될 때 연결 시작
    if (this.subscribers.size === 1 && !this.ws) {
      this.connect();
    }
  }

  removeSubscriber(callback: TickerCallback) {
    this.subscribers.delete(callback);
    // 마지막 구독자가 제거되면 연결 종료
    if (this.subscribers.size === 0 && this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private notifySubscribers(data: BithumbTickerData) {
    this.subscribers.forEach(callback => callback(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

// 싱글톤 인스턴스 생성
export const bithumbWebSocket = new BithumbWebSocket();

/**
 * 다양한 tickType을 지원하는 함수
 * @param ticker - 변환할 티커 응답 객체
 * @returns UTCTimestamp - 변환된 UTC 타임스탬프
 */
export const convertTickerToUTCTimestamp = (ticker: BithumbTickerData): UTCTimestamp => {
  const { date, time, tickType } = ticker;

  // 유효성 검사
  if (!/^\d{8}$/.test(date)) {
    throw new Error(`Invalid date format: ${ date }`);
  }
  if (!/^\d{6}$/.test(time)) {
    throw new Error(`Invalid time format: ${ time }`);
  }

  // 날짜 파싱
  const year = parseInt(date.slice(0, 4), 10);
  const month = parseInt(date.slice(4, 6), 10) - 1; // 0-based
  const day = parseInt(date.slice(6, 8), 10);

  // 시간 파싱
  const hour = parseInt(time.slice(0, 2), 10);
  const minute = parseInt(time.slice(2, 4), 10);
  const second = parseInt(time.slice(4, 6), 10);

  // 로컬 시간 기준 Date 객체 생성
  const localDate = new Date(year, month, day, hour, minute, second);

  // tickType에 따른 시간 내림 처리
  const adjustedDate = new Date(localDate); // Date 객체 복제

  const unitMatch = tickType.match(/^(\d+)([MH])$/);
  if (!unitMatch) {
    throw new Error(`Unsupported tickType format: ${ tickType }`);
  }

  const [ , unitStr, unitType ] = unitMatch;
  const unit = parseInt(unitStr, 10);

  if (isNaN(unit) || unit <= 0) {
    throw new Error(`Invalid tickType unit: ${ tickType }`);
  }

  if (unitType === 'M') {
    const flooredMinute = Math.floor(minute / unit) * unit;
    adjustedDate.setMinutes(flooredMinute, 0, 0); // 분 내림, 초 및 밀리초 0으로 설정
  } else if (unitType === 'H') {
    const flooredHour = Math.floor(hour / unit) * unit;
    adjustedDate.setHours(flooredHour, 0, 0, 0); // 시 내림, 분, 초 및 밀리초 0으로 설정
  } else {
    throw new Error(`Unsupported tickType unit type: ${ tickType }`);
  }

  console.log('adjustedDate:', adjustedDate);

  // UTC 타임스탬프 변환
  const utcTimestamp: UTCTimestamp = Math.floor(adjustedDate.getTime() / 1000) as UTCTimestamp;

  return utcTimestamp;
};
