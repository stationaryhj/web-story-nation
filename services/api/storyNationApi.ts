import axios from 'axios'
import { useAccountStore } from '@/store/useStoreData'

import type {
  ApiResponse,
  LoginResponse,
  ModuleCharacter,
  CharbotTop10Response,
  CharbotListResponse,
  TagRankingListResponse,
  CharbotSearchResponse,
  CharbotChatListResponse,
  CoinListResponse,
  OrderIdResponse,
  CharbotChatModeResponse,
  CharbotResponse,
  CharbotInprogressResponse,
  CharbotGetListMineResponse,
  ChatUseResponse,
  CoinChargeUseHistoryResponse,
  ConfirmTossPaymentResponse,
} from '../../types/api'

// API 기본 설정
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000 * 30 * 10, // timeout 30초
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  })

  // 응답 인터셉터 설정
  instance.interceptors.response.use(
    response => {
      return response
    },
    error => {
      if (error.response) {
        console.error('API Error:', error.response.data)
        return Promise.reject(error.response.data)
      } else if (error.request) {
        console.error('Network Error:', error.request)
        return Promise.reject({ message: '네트워크 오류가 발생했습니다.' })
      } else {
        console.error('Request Error:', error.message)
        return Promise.reject({ message: '요청 중 오류가 발생했습니다.' })
      }
    }
  )

  return instance
}

// 환경에 따른 API URL 설정
// const API_URL = process.env.NODE_ENV === 'production' ?
//   process.env.NEXT_PUBLIC_STORYNATION_PROD_API_URL :
//   process.env.NEXT_PUBLIC_STORYNATION_API_URL;

// release
// const API_URL = process.env.NEXT_PUBLIC_STORYNATION_PROD_API_URL;
const API_URL = process.env.NEXT_PUBLIC_STORYNATION_API_URL

const CHAT_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_STORYNATION_PROD_CHAT_URL
    : process.env.NEXT_PUBLIC_STORYNATION_CHAT_URL

// API 인스턴스 생성
const api = createApiInstance(API_URL || '')
const chatApiInstance = createApiInstance(CHAT_URL || '')

// 인증 토큰 설정 함수
const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    chatApiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
    delete chatApiInstance.defaults.headers.common['Authorization']
  }
}

// 로컬 스토리지에서 토큰 가져와서 설정
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('authorization')?.replaceAll('"', '')
  if (token) {
    setAuthToken(token)
  }
}

// 콘텐츠 API
export const contentApi = {
  // 로그인
  login2: async (snsauth: string, snstype: number, snsid: string, kr_gb: string): Promise<ApiResponse> => {
    return api.post('/api/login2', {
      snsauth,
      snstype,
      snsid,
      kr_gb,
    })
  },

  // 회원정보
  userinfo: async (access_token: string): Promise<ApiResponse> => {
    const _access_token = `Bearer ${access_token}`
    api.defaults.headers.common['Authorization'] = _access_token
    return api.get('/api/userinfo')
  },

  // 회원가입
  register4: async (
    snsauth: string,
    snstype: number,
    snsid: string,
    nicknm: string,
    birth: string,
    accessToken: string,
    marketing_agree: number
  ): Promise<ApiResponse> => {
    return api.post('/api/register4', {
      snsauth,
      snstype,
      snsid,
      nicknm,
      birth,
      accessToken,
      marketing_agree,
    })
  },

  loginDcheckV2: async (snsauth: string, snstype: number, token: string): Promise<ApiResponse> => {
    return api.post('/api/loginDcheckV2', {
      snsauth,
      snstype,
      token,
    })
  },

  getToken: async (snsauth: number, token_key: string): Promise<ApiResponse> => {
    return api.post('/api/snsgettoken', {
      snsauth,
      token_key,
    })
  },

  getUuid: async (snstype: number): Promise<ApiResponse> => {
    return api.post('/api/get/uuid', {
      snstype,
    })
  },

  LoginGuest: async (nick_nm: string): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/api/guestlogin', {
      nick_nm,
    })
  },

  // Top10
  GetTop10: async (): Promise<ApiResponse<CharbotTop10Response>> => {
    return api.post('/api/charbot/rcmnd/top10')
  },

  // List
  GetListRcmnd: async (
    module_id: number,
    page: number,
    paginate: number
  ): Promise<ApiResponse<Array<ModuleCharacter>>> => {
    return api.post('/api/charbot/rcmnd/getlist', {
      module_id,
      page,
      paginate,
    })
  },

  GetList: async (
    type: string,
    chrbot_tag_keys: string,
    nsfw: number,
    order: number,
    page: number,
    paginate: number
  ): Promise<ApiResponse<CharbotSearchResponse>> => {
    return api.post('/api/charbot/getlist', {
      type,
      chrbot_tag_keys,
      nsfw,
      order,
      page,
      paginate,
    })
  },

  GetTagRankingList: async (type: number): Promise<ApiResponse<TagRankingListResponse>> => {
    return api.post('/api/charbot/tagranking/get', {
      type,
    })
  },

  GetTagList: async (): Promise<ApiResponse> => {
    return api.post('/api/charbot/tag/get')
  },

  SendFeedback: async (content: string): Promise<ApiResponse> => {
    return api.post('/api/charbot/feedback', {
      content,
    })
  },

  GetChatList: async (paginate: number, page: number): Promise<ApiResponse<CharbotChatListResponse>> => {
    // 토큰 직접 구성
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/chat/list', {
      paginate,
      page,
    })
  },

  GetChatTopFixed: async (chrbot_chat_key: number, fixed: number): Promise<ApiResponse> => {
    return api.post('/api/charbot/chat/topfixed', {
      chrbot_chat_key,
      fixed,
    })
  },

  GetSearch: async (search: string, order: number, paginate: number, page: number): Promise<ApiResponse> => {
    return api.post('/api/charbot/search', {
      search,
      order,
      paginate,
      page,
    })
  },

  // 캐봇 좋아요
  CharBotLike: async (world_list_detail_chrbot_key: number): Promise<ApiResponse> => {
    return api.post('/api/charbot/like', {
      world_list_detail_chrbot_key,
    })
  },

  // 캐봇신고
  ReportChatBot: async (
    report_type: number,
    target_key: number,
    c_report_key: number,
    content: string,
    countryCode: string
  ): Promise<ApiResponse> => {
    return api.post('/api/reportadd', {
      report_type,
      target_key,
      c_report_key,
      content,
      countryCode,
    })
  },

  // 페르소나 이름변경
  ChangePersonaName: async (persona: string, persona_gender: number): Promise<ApiResponse> => {
    return api.post('/api/personachange', {
      persona,
      persona_gender,
    })
  },

  // 캐봇 챗 모드 가져오기
  GetChatMode: async (): Promise<ApiResponse<CharbotChatModeResponse>> => {
    return api.post('/api/charbot/chatmode')
  },
}

// 채팅 API
export const chatApi = {
  // 펜 사용
  UseChat: async (chrbot_chat_key: number, chat_mode: number): Promise<ApiResponse<ChatUseResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return chatApiInstance.post('/api/charbot/chat/user', {
      chrbot_chat_key,
      chat_mode,
    })
  },

  OpenChat: async (chrbot_chat_key: number, chat_mode: number, nsfw: number): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    chatApiInstance.defaults.headers.common['Authorization'] = account_token
    return chatApiInstance.post('/api/charbot/chat/open', {
      chrbot_chat_key,
      chat_mode,
      nsfw,
    })
  },

  CloseChat: async (chrbot_chat_key: number): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    chatApiInstance.defaults.headers.common['Authorization'] = account_token
    return chatApiInstance.post('/api/charbot/chat/close', {
      chrbot_chat_key,
    })
  },

  // 메세지 전송
  SendChat: async (
    chat_mode: number,
    nsfw: number,
    prompt_key: string,
    chrbot_chat_key: number,
    stream: boolean,
    ai_message: string = '',
    user_message: string = ''
  ): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/send', {
      chat_mode,
      nsfw: 1,
      prompt_key,
      chrbot_chat_key,
      stream: stream ? 1 : 0,
      countryCode: 'KR',
      ai_message,
      user_message,
    })
  },

  // 메세지 정렬
  ArrangeChat: async (chrbot_chat_key: number, chat_mode: number, nsfw: number): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/arrange', {
      chrbot_chat_key,
      chat_mode,
      nsfw,
    })
  },

  // 메세지 요약
  SummaryChat: async (chrbot_chat_key: number, summary_id: string, countryCode: string): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/summary', {
      chrbot_chat_key,
      summary_id,
      countryCode,
    })
  },

  // 메세지 삭제
  DeleteChat: async (
    chrbot_chat_key: number,
    chat_mode: number,
    nsfw: number,
    delete_id: string,
    delete_idx: number
  ): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/delete', {
      chrbot_chat_key,
      chat_mode,
      nsfw,
      delete_id,
      delete_idx,
    })
  },

  // 채팅방 메세지 초기화
  InitChat: async (chrbot_chat_key: number, chat_mode: number, nsfw: number): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/init', {
      chrbot_chat_key,
      chat_mode,
      nsfw,
    })
  },
}

// 정산 API
export const settlementApi = {
  // 수익 내역
  GetSettlementList: async (type: number, page: number, paginate: number): Promise<ApiResponse> => {
    return api.post('/api/sales/monthlyIncomeList_v2', {
      type,
      page,
      paginate,
    })
  },

  GetOrderId: async (): Promise<ApiResponse<OrderIdResponse>> => {
    return api.post('/api/getorderid')
  },

  GetCoinList: async (): Promise<ApiResponse<CoinListResponse>> => {
    return api.post('/api/coinlist')
  },

  // 코인 사용 내역
  GetCoinChargeUseHistory: async (
    page: number,
    paginate: number,
    charge_type: number
  ): Promise<ApiResponse<CoinChargeUseHistoryResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/getcoinchargeusehistory_v2', {
      page,
      paginate,
      charge_type,
    })
  },

  ConfirmTossPayment: async (
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<ApiResponse<ConfirmTossPaymentResponse>> => {
    return api.post('/api/web/toss/confirm', {
      paymentKey,
      orderId,
      amount,
    })
  },
}

// 크리에이트 API
export const createApi = {
  GetCreateChatBotInProgress: async (
    world_list_detail_chrbot_key: number | null
  ): Promise<ApiResponse<CharbotInprogressResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/inprogress/get', {
      world_list_detail_chrbot_key,
    })
  },

  // 현재 작업중인 캐봇 저장
  SaveInProgress: async (
    world_list_detail_chrbot_key: string,
    img_url: string,
    title: string,
    gender: number,
    intro: string,
    first_talk: string,
    content: string,
    example: string,
    nsfw: number,
    img_url_nsfw: string,
    show_yn: number,
    content_show_yn: number,
    example_show_yn: number,
    finish_yn: number
  ): Promise<ApiResponse> => {
    return api.post('/api/charbot/inprogress/save', {
      world_list_detail_chrbot_key,
      img_url,
      title,
      gender,
      intro,
      first_talk,
      content,
      example,
      nsfw,
      img_url_nsfw,
      show_yn,
      finish_yn,
      content_show_yn,
      example_show_yn,
    })
  },

  SaveCreateChatBotTag: async (
    world_list_detail_chrbot_key: number,
    tags: string,
    c_chrbot_tag_key: string
  ): Promise<ApiResponse> => {
    return api.post('/api/charbot/inprogress/save/tag', {
      world_list_detail_chrbot_key,
      tags,
      c_chrbot_tag_key,
    })
  },

  // 캐봇삭제
  DeleteChatBot: async (world_list_detail_chrbot_key: number): Promise<ApiResponse> => {
    return api.post('/api/charbot/delete', {
      world_list_detail_chrbot_key,
    })
  },

  GetCreateChatBotList: async (target_nick_nm: string, page: number, paginate: number): Promise<ApiResponse> => {
    return api.post('/api/charbot/getlist/user', {
      target_nick_nm,
      page,
      paginate,
    })
  },

  GetCreateChatBotListMine: async (
    target_nick_nm: string,
    page: number,
    paginate: number
  ): Promise<ApiResponse<CharbotGetListMineResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/getlist/mine', {
      target_nick_nm,
      page,
      paginate,
    })
  },

  GetChatBot: async (world_list_detail_chrbot_key: number): Promise<ApiResponse<CharbotResponse>> => {
    return api.post('/api/charbot/get', {
      world_list_detail_chrbot_key,
    })
  },

  GetChatBotAuth: async (): Promise<ApiResponse> => {
    return api.post('/api/charbot/get/auth')
  },
}

export { setAuthToken, API_URL, CHAT_URL }
