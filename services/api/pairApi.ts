import axios from 'axios';
import { api } from './axiosInstance';

// 토큰 정보 타입
interface MtrToken {
  chain_id: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: boolean;
  reserve_amount?: string;
}

// 페어 정보 타입
interface MtrPair {
  a_key: string;
  chain_id: string;
  handler: string;
  handler_name: string;
  ab_token: string;
  pair: string;
  token: MtrToken[];  // 토큰 쌍(0, 1)
  state: number;
  number: string;
  create_time: string;
}

// 응답 타입
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

export const pairApi = {
  //페어 조회

  // TokenAB에 대한 Pair 리스트 요청
  getPairs: async (tokenA: string, tokenB: string): Promise<ApiResponse<MtrPair[]>> => {
    try {
      const response = await api.get<ApiResponse<MtrPair[]>>(`/api/book/ab_token/pairs?token_a=${tokenA}&token_b=${tokenB}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || '서버 에러가 발생했습니다.');
      }
      throw error;
    }
  }
}
