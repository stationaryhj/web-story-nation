import { api } from './axiosInstance'
import { TokenInfo, TokenList, TokenListResponse } from './types/token'

interface QueryERC20Params {
  token: string[]
  owner: string[]
  spender: string[]
}

// 토큰/ERC20 관련 API
export const tokenApi = {

  getTokenList: async (): Promise<TokenList[]> => {
    try {
      // axiosInstance가 이미 response.data를 리턴하므로
      // 바로 TokenListResponse 타입으로 받음
      const response = await api.get('/api/erc20/list')
      return response.data
    } catch (error) {
      console.error('토큰 리스트 조회 중 에러:', error)
      throw error
    }
  },
  // ERC20 토큰 정보 조회
  queryERC20: async (params: QueryERC20Params) => {
    try {
      const response = await api.post('/api/query/erc20/', {
        token: params.token,
        owner: params.owner,
        spender: params.spender
      });
      
      console.log('API 응답 전체:', response);
      
      if (!response) {
        throw new Error('ERC20 조회 실패:' + response);
      }
      const data = response.data;
      console.log(data,'data')
      return data; // 여기서 .data를 반환
      
    } catch (error) {
      console.error('ERC20 API 호출 에러:', error);
      throw error;
    }
  }
} 