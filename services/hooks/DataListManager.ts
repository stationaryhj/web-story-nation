import { useQuery } from '@tanstack/react-query'

import type {
  CharbotTop10Response,
  LoginResponse,
  CharbotSearchResponse,
  TagRankingListResponse,
  ApiResponse,
  CharbotChatListResponse,
  OrderIdResponse,
  CoinListResponse,
  CharbotChatModeResponse,
  CharbotResponse,
  CharbotInprogressResponse,
  CharbotGetListMineResponse,
  CoinChargeUseHistoryResponse,
  SaleMonthlyIncomeListResponse,
  ChatUseResponse,
  TagListResponse,
  InquiryListResponse,
  BankListResponse,
  CharbotTop10NewResponse,
  WriterWithdrawResponse,
  GetPresignedUrlResponse,
  WithdrawRequestListResponse,
  SaleMonthlyIncomeResponse,
} from '@/types/api'

import { contentApi, settlementApi, createApi, chatApi } from '../api/storyNationApi'

export type CategoryId = 'all' | 'male' | 'female' | 'unknown'
type Category = {
  id: CategoryId
  name: string
  type: string
}

export const CATEGORIES: Array<Category> = [
  { id: 'all', name: '추천', type: 'recommend' },
  { id: 'male', name: '남성', type: '1' },
  { id: 'female', name: '여성', type: '2' },
  { id: 'unknown', name: '성별모름', type: '3' },
]

export const ReqTop10Characters = () => {
  const { data, isLoading, error, refetch } = useQuery<CharbotTop10Response>({
    queryKey: ['RequestTop10'],
    queryFn: async () => {
      const response = await contentApi.GetTop10()

      return response?.data as CharbotTop10Response
    },
  })

  return { data, isLoading, error, refetch }
}


export const ReqTop10CharactersNew = () => {
  const { data, isLoading, error, refetch } = useQuery<CharbotTop10NewResponse>({
    queryKey: ['RequestTop10New'],
    queryFn: async () => {
      const response = await contentApi.GetTop10New()

      return response?.data as CharbotTop10NewResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqGetCharacterList = (
  activeCategory: string,
  nsfw: number | 0,
  page: number | 1,
  paginate: number | 10,
  order: number | 0,
  tag: string = ''
) => {
  const { data, isLoading, error, refetch } = useQuery<CharbotSearchResponse>({
    queryKey: ['characters', activeCategory, nsfw, order, tag],
    queryFn: async () => {
      const category = CATEGORIES.find(cat => cat.id === activeCategory)
      if (!category || category.id === 'all') {
        // CharbotSearchResponse 형식에 맞게 빈 객체 반환
        return {
          result: { err: 0, msg: '' },
          chrbotList: {
            current_page: 1,
            data: [],
            first_page_url: '',
            from: 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: 10,
            prev_page_url: null,
            to: 0,
            total: 0,
          },
        }
      }

      // tag 값이 쉼표로 구분된 값이면 합집합으로 처리하기 위해 그대로 전달
      // 백엔드에서 합집합으로 처리 (여러 태그 중 하나라도 포함하면 결과에 포함)
      // 특별한 변환 없이 그대로 전달
      const response = await contentApi.GetList(
        category.type, // type (1: 남자, 2: 여자, 3: 모름)
        tag, // chrbot_tag_keys - 쉼표로 구분된 태그 ID (합집합)
        nsfw, // nsfw
        order, // order - 이미 number 타입
        page, // page
        paginate // paginate
      )

      // 응답 데이터 유효성 검사
      if (!response || !response.data) {
        console.error('Invalid response data:', response)
        // CharbotSearchResponse 형식에 맞게 빈 객체 반환
        return {
          result: { err: 0, msg: '' },
          chrbotList: {
            current_page: 1,
            data: [],
            first_page_url: '',
            from: 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: 10,
            prev_page_url: null,
            to: 0,
            total: 0,
          },
        }
      }

      return response.data as CharbotSearchResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqGetTags = (categoryType: number) => {
  const { data, isLoading, error } = useQuery<TagRankingListResponse>({
    queryKey: ['tagRanking', categoryType],
    queryFn: async () => {
      const response = await contentApi.GetTagRankingList(categoryType)
      return response.data as TagRankingListResponse
    },
  })

  return { data, isLoading, error }
}

export const ReqGetChatList = (paginate: number, page: number) => {
  const { data, isLoading, error, refetch } = useQuery<CharbotChatListResponse>({
    queryKey: ['chatList', paginate, page],
    queryFn: async () => {
      const response = await contentApi.GetChatList(paginate, page)
      return response.data as CharbotChatListResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqLogin = (nick_nm: string) => {
  const { data, isLoading, error, refetch } = useQuery<LoginResponse>({
    queryKey: ['loginGuest'],
    queryFn: async () => {
      const response = await contentApi.LoginGuest(nick_nm)
      return response.data as LoginResponse
    },
  })

  return { data, isLoading, error, refetch }
}

// 이녀석은 차후 신성도 유지해야함.
export const ReqGetOrderId = () => {
  const { data, isLoading, error, refetch } = useQuery<OrderIdResponse>({
    queryKey: ['orderId'],
    queryFn: async () => {
      const response = await settlementApi.GetOrderId('0')
      return response.data as OrderIdResponse
    },
  })

  return { data, isLoading, error, refetch }
}

// 이녀석은 차후 신성도 유지해야함.
export const ReqGetCoinList = () => {
  const { data, isLoading, error, refetch } = useQuery<CoinListResponse>({
    queryKey: ['coinList'],
    queryFn: async () => {
      const response = await settlementApi.GetCoinList()
      return response.data as CoinListResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqGetChatMode = () => {
  const { data, isLoading, error, refetch } = useQuery<CharbotChatModeResponse>({
    queryKey: ['chatMode'],
    queryFn: async () => {
      const response = await contentApi.GetChatMode()
      return response.data as CharbotChatModeResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqGetChatBot = (world_list_detail_chrbot_key: number) => {
  const { data, isLoading, error, refetch } = useQuery<CharbotResponse>({
    queryKey: ['createChatBot', world_list_detail_chrbot_key],
    queryFn: async () => {
      const response = await createApi.GetChatBot(world_list_detail_chrbot_key)
      return response.data as CharbotResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const GetCreateChatBotListMine = (target_nick_nm: string, page: number, paginate: number) => {
  const { data, isLoading, error, refetch } = useQuery<CharbotGetListMineResponse>({
    queryKey: ['createChatBotListMine', target_nick_nm, page, paginate],
    queryFn: async () => {
      const response = await createApi.GetCreateChatBotListMine(target_nick_nm, page, paginate)
      return response.data as CharbotGetListMineResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqGetCoinChargeUseHistory = (charge_type: number, page: number, paginate: number) => {
  const { data, isLoading, error, refetch } = useQuery<CoinChargeUseHistoryResponse>({
    queryKey: ['coinChargeUseHistory', charge_type, page, paginate],
    queryFn: async () => {
      const response = await settlementApi.GetCoinChargeUseHistory(page, paginate, charge_type)
      return response.data as CoinChargeUseHistoryResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const GetSettlementList = (type: number, page: number, paginate: number) => {
  const { data, isLoading, error, refetch } = useQuery<SaleMonthlyIncomeListResponse>({
    queryKey: ['settlementList', type, page, paginate],
    queryFn: async () => {
      const response = await settlementApi.GetSettlementList(type, page, paginate)
      return response.data as SaleMonthlyIncomeListResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const UseChat = (chrbot_chat_key: number, chat_mode: number) => {
  const { data, isLoading, error, refetch } = useQuery<ChatUseResponse>({
    queryKey: ['useChat', chrbot_chat_key, chat_mode],
    queryFn: async () => {
      const response = await chatApi.UseChat(chrbot_chat_key, chat_mode)
      return response.data as ChatUseResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqGetCreateChatBotInProgress = (world_list_detail_chrbot_key: number | null) => {
  const { data, isLoading, error, refetch } = useQuery<CharbotInprogressResponse>({
    queryKey: ['createChatBotInProgress', world_list_detail_chrbot_key],
    queryFn: async () => {
      const response = await createApi.GetCreateChatBotInProgress(world_list_detail_chrbot_key)
      return response.data as CharbotInprogressResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const ReqGetInquiryList = (page: number, paginate: number) => {
  const { data, isLoading, error, refetch } = useQuery<InquiryListResponse>({
    queryKey: ['inquiryList', page, paginate],
    queryFn: async () => {
      const response = await contentApi.GetInquiryList(page, paginate)
      return response.data as InquiryListResponse
    },
  })

  return { data, isLoading, error, refetch }
}

// SaveInProgress API 호출을 위한 함수 추가
export const ReqSaveCreateChatBotInProgress = async (payload: {
  world_list_detail_chrbot_key: string
  img_url: string
  title: string
  gender: number
  intro: string
  first_talk: string
  content: string
  example: string
  nsfw: number
  img_url_nsfw: string
  show_yn: number
  content_show_yn: number
  example_show_yn: number
  finish_yn: number
}) => {
  try {
    const response = await createApi.SaveInProgress(
      payload.world_list_detail_chrbot_key,
      payload.img_url,
      payload.title,
      payload.gender,
      payload.intro,
      payload.first_talk,
      payload.content,
      payload.example,
      payload.nsfw,
      payload.img_url_nsfw,
      payload.show_yn,
      payload.content_show_yn,
      payload.example_show_yn,
      payload.finish_yn,
    )

    return { data: response.data, error: null }
  } catch (error) {
    console.error('SaveInProgress API 호출 오류:', error)
    return { data: null, error }
  }
}

export const GetTagList = () => {
  const { data, isLoading, error, refetch } = useQuery<TagListResponse>({
    queryKey: ['tagList'],
    queryFn: async () => {
      const response = await contentApi.GetTagList()
      return response.data as TagListResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const GetBankList = () => {
  const { data, isLoading, error, refetch } = useQuery<BankListResponse>({
    queryKey: ['bankList'],
    queryFn: async () => {
      const response = await contentApi.GetBankList()
      return response.data as BankListResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const GetWriterWithdrawStatus = () => {
  const { data, isLoading, error, refetch } = useQuery<WriterWithdrawResponse>({
    queryKey: ['writerWithdrawStatus'],
    queryFn: async () => {
      const response = await settlementApi.GetWriterWithdrawStatus()
      return response.data as WriterWithdrawResponse
    },
  })

  return { data, isLoading, error, refetch }
}


export const GetSearch = (search: string, order: number, paginate: number, page: number) => {
  const { data, isLoading, error, refetch } = useQuery<CharbotSearchResponse>({
    queryKey: ['search', search, order, paginate, page],
    queryFn: async () => {
      const response = await contentApi.GetSearch(search, order, paginate, page)
      return response.data as CharbotSearchResponse
    },
  })

  return { data, isLoading, error, refetch }
}

export const GetWithdrawRequestList = (page: number, paginate: number) => {
  const { data, isLoading, error, refetch } = useQuery<WithdrawRequestListResponse>({
    queryKey: ['withdrawRequestList', page, paginate],
    queryFn: async () => {
      const response = await settlementApi.GetWithdrawRequestList(page, paginate)
      return response.data as WithdrawRequestListResponse
    },
  })

  return { data, isLoading, error, refetch }
}



export const GetMonthlyIncome = (type: number) => {
  const { data, isLoading, error, refetch } = useQuery<SaleMonthlyIncomeResponse>({
    queryKey: ['monthlyIncome', type],
    queryFn: async () => {
      const response = await settlementApi.GetMonthlyIncome(type)
      return response.data as SaleMonthlyIncomeResponse
    },
  })

  return { data, isLoading, error, refetch }
}

