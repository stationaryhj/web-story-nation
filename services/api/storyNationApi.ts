import axios from 'axios'
import type { PriSignedUrlInfo } from '@/services/define'
import { ChatLikeabilityData, requestConnectedChatRoomData, requestLikeAbilityData } from '@/services/interface'
import { useAccountStore } from '@/store/useStoreData'
import { useModalStore } from '@/store/useStoreModal'
import { useSettingsStore } from '@/store/useStoreSettings'
import type {
  ApiResponse,
  BankAccountEditResponse,
  BankListResponse,
  ChangePersonaNameResponse,
  CharbotChatListResponse,
  CharbotChatModeResponse,
  CharbotGetListMineResponse,
  CharbotInprogressResponse,
  CharbotLikeResponse,
  CharbotResponse,
  CharbotSearchResponse,
  CharbotTop10NewResponse,
  CharbotTop10Response,
  ChatFreePenResponse,
  ChatLikeabilityResponse,
  ChatLikeabilitySaveResponse,
  ChatSaveResponse,
  ChatUseResponse,
  CoinChargeUseHistoryResponse,
  CoinListResponse,
  ConfirmTossPaymentResponse,
  GetPassInfoResponse,
  GetPresignedUrlMultiResponse,
  GetPresignedUrlResponse,
  GetSearchResponse,
  GetTop10RankingCreaterResponse,
  GetTop10RankingResponse,
  GetUuidResponse,
  GuestLoginResponse,
  InquiryListResponse,
  LoginResponse,
  NicknmChangeResponse,
  OpenChatResponse,
  OrderIdResponse,
  Register4Response,
  SaleMonthlyIncomeListResponse,
  SaleMonthlyIncomeResponse,
  SendFeedbackResponse,
  TagListResponse,
  TagRankingListResponse,
  UnlockMultiImageResponse,
  UserInfoResponse,
  ViewTermsResponse,
  WithdrawRequestListResponse,
  WriteRemailEditResponse,
  WriterInfoResponse,
  WriterWithdrawResponse,
} from '../../types/api'

// API 기본 설정
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000 * 30 * 10, // timeout 30초
    headers: {
      'Content-Type': 'application/json',
      'X-Web-Access': true,
    },
    withCredentials: false,
  })

  // 응답 인터셉터 설정
  instance.interceptors.response.use(
    response => {
      return response
    },
    error => {
      /* if (error.response) {
        // 401 에러 처리 - 인증 만료 시 메인 페이지로 리다이렉트
        if (error.response.status === 401) {
          const { openModal, closeModal } = useModalStore.getState()
          openModal('confirmAction', {
            title: '토큰 만료',
            description: `토큰이 만료 되었습니다. 다시 로그인 해주세요.`,
            onConfirm: async () => {
              useAccountStore.getState().logout()
              closeModal()

              if (typeof window !== 'undefined') {
                window.location.href = '/'
              }
            },
            onCancel: () => {
              useAccountStore.getState().logout()
              closeModal()

              if (typeof window !== 'undefined') {
                window.location.href = '/'
              }
            },
            confirmText: '확인',
            cancelText: '취소',
            confirmButtonClass: 'bg-primary-500 hover:bg-primary-600 text-white',
          })
          return Promise.reject(error.response.data)
        }
        
        console.error('API Error:', error.response.data)
        return Promise.reject(error.response.data)
      } else if (error.request) {
        console.error('Network Error:', error.request)
        return Promise.reject({ message: '네트워크 오류가 발생했습니다.' })
      } else {
        console.error('Request Error:', error.message)
        return Promise.reject({ message: '요청 중 오류가 발생했습니다.' })
      } */
    }
  )

  return instance
}

const API_URL = process.env.NEXT_PUBLIC_STORYNATION_API_URL
const CHAT_URL = process.env.NEXT_PUBLIC_STORYNATION_CHAT_URL

// API 인스턴스 생성
const api = createApiInstance(API_URL || '')
const chatApiInstance = createApiInstance(API_URL || '')

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

export const GetApiUrl = () => {
  return API_URL
}

// 콘텐츠 API
export const contentApi = {
  /**
   * 프로필 이미지 수정
   * @param profile_url 프로필 이미지 주소
   */
  myprofileupdate: async (profile_url: string): Promise<ApiResponse> => {
    const _access_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = _access_token
    return api.post('/api/myprofileupdate', {
      profile_url,
    })
  },

  /**
   * 자기소개 수정
   * @param intro 자기소개
   */
  myintroupdate: async (intro: string): Promise<ApiResponse> => {
    const _access_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = _access_token
    return api.post('/api/myintroupdate', {
      intro,
    })
  },

  /**
   * 로그인
   * @param snsauth   소셜 로그인 인증 키
   * @param snstype   1: 카카오, 2: 네이버, 3: 구글, 4: 애플
   * @param snsid     소셜 로그인 아이디
   * @param kr_gb     0: 외국인, 1: 국내인
   */
  login2: async (
    snsauth: string,
    snstype: number,
    snsid: string,
    kr_gb: string,
    access_token: string = ''
  ): Promise<ApiResponse<LoginResponse>> => {
    if (access_token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    }

    return api.post('/api/login2', {
      snsauth,
      snstype,
      snsid,
      kr_gb,
    })
  },

  /**
   * 게스트 로그인
   * @param nick_nm   닉네임
   */
  LoginGuest: async (nick_nm: string): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/api/guestlogin', {
      nick_nm,
    })
  },

  /**
   * 회원정보
   * @param access_token 토큰 ( Login 후 정보에 들어있음음 )
   * login 후 정보를 저장하기때문에 현재는 사용안함
   */
  userinfo: async (access_token: string): Promise<ApiResponse<UserInfoResponse>> => {
    const _access_token = `Bearer ${access_token}`
    api.defaults.headers.common['Authorization'] = _access_token
    return api.get('/api/userinfo')
  },

  userinfo2: async (access_token: string): Promise<ApiResponse> => {
    const _access_token = `Bearer ${access_token}`
    api.defaults.headers.common['Authorization'] = _access_token
    return api.post('/api/myuserinfo')
  },

  /**
   * 회원가입
   * @param snsauth     소셜 로그인 인증 키
   * @param snstype     1: 카카오, 2: 네이버, 3: 구글, 4: 애플
   * @param snsid       소셜 로그인 아이디
   * @param nicknm      닉네임
   * @param birth       생년월일 ( 19900101 )
   * @param accessToken 토큰
   * @param marketing_agree 마케팅 동의 여부 ( 0: 동의, 1: 동의하지 않음 )
   */
  register4: async (
    snsauth: string,
    snstype: number,
    snsid: string,
    nicknm: string,
    birth: string,
    accessToken: string,
    marketing_agree: number
  ): Promise<ApiResponse<Register4Response>> => {
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

  /**
   * 로그인 체크
   * @param snsauth 소셜 로그인 인증 키
   * @param snstype 1: 카카오, 2: 네이버, 3: 구글, 4: 애플
   * @param token 토큰
   */
  loginDcheckV2: async (
    snsauth: string,
    snstype: number,
    token: string,
    appleAccessToken: string
  ): Promise<ApiResponse> => {
    return api.post('/api/loginDcheckV2', {
      snsauth,
      snstype,
      token,
      appleAccessToken,
    })
  },

  /**
   * 로그아웃
   */
  Signout: async (): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/signout')
  },

  /**
   * 토큰 가져오기
   * @param snsauth 소셜 로그인 인증 키
   * @param token_key 토큰 키
   */
  getToken: async (snsauth: number, token_key: string): Promise<ApiResponse> => {
    return api.post('/api/snsgettoken', {
      snsauth,
      token_key,
    })
  },

  /**
   * UUID 가져오기
   * @param snstype 1: 카카오, 2: 네이버, 3: 구글, 4: 애플
   */
  getUuid: async (snstype: number): Promise<ApiResponse<GetUuidResponse>> => {
    return api.post('/api/get/uuid', {
      snstype,
    })
  },

  /**
   * Top10
   * 현재 new 로 사용중
   */
  GetTop10: async (): Promise<ApiResponse<CharbotTop10Response>> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/rcmnd/top10', {
      safety,
    })
  },

  /**
   * Top10 New
   */
  GetTop10New: async (): Promise<ApiResponse<CharbotTop10NewResponse>> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/rcmnd/top10', {
      safety,
    })
  },

  /**
   * Top10 랭킹
   * @param countryCode 국가 코드 ( KR )
   * @param module_type 모듈 타입 ( 2: 캐릭터 랭킹 필터, 3 : 작가 랭킹 필터 )
   * @param ranking_type 랭킹 타입
   * 캐릭터 - 1: 일간, 2: 주간, 3: 월간, 4: 리얼
   * 작가 - 2: 주간, 3: 월간, 5: 전체  )
   */
  GetTop10Ranking: async (
    countryCode: string,
    ranking_type: number,
    gender: number,
    module_type: number
  ): Promise<ApiResponse> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/rcmnd/ranking/top10', {
      countryCode,
      module_type,
      ranking_type,
      gender,
      safety,
    })
  },

  /**
   * Top10 랭킹
   * @param countryCode 국가 코드 ( KR )
   * @param module_type 모듈 타입 ( 2: 캐릭터 랭킹 필터, 3 : 작가 랭킹 필터 )
   * @param ranking_type 랭킹 타입
   * 캐릭터 - 1: 일간, 2: 주간, 3: 월간, 4: 리얼
   * 작가 - 2: 주간, 3: 월간, 5: 전체  )
   */
  GetTop10RankingCreater: async (
    countryCode: string,
    ranking_type: number
  ): Promise<ApiResponse<GetTop10RankingCreaterResponse>> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/rcmnd/ranking/top10', {
      countryCode,
      module_type: 3,
      ranking_type,
      safety,
    })
  },

  /**
   * 추천 리스트
   * @param module_id 모듈 아이디
   * @param ranking_type 랭킹 타입
   * module_id9 : ( 캐봇랭킹 ) - 1: 일간, 2: 주간, 3: 월간, 4: 리얼
   * module_id10 : ( 작가랭킹 ) - 2: 주간, 3: 월간, 5: 전체
   * @param page 페이지
   * @param paginate 페이지 당 아이템 수
   * @param gender 성별 module_id9 일 경우에만 해당 ( 1: 남자, 2: 여자, 3, 모름, 4: 전체 )
   */
  GetListRcmnd: async (
    module_id: number,
    ranking_type: number,
    page: number,
    paginate: number,
    gender: number
  ): Promise<ApiResponse<GetTop10RankingResponse>> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/rcmnd/getlist', {
      module_id,
      ranking_type,
      page,
      paginate,
      gender,
      safety,
    })
  },

  /**
   * 캐봇 리스트
   * @param type 타입 ( 1: 남자, 2: 여자, 3: 모름 )
   * @param chrbot_tag_keys 태그 키 ( number , 쉼표로 구분 )
   * @param nsfw 1: 성인(짜릿모드), 2: 노멀, 3: 성인 + 노멀
   * @param order 1: 인기순, 2: 생성순
   * @param page 페이지
   * @param paginate 페이지 당 아이템 수
   */
  GetList: async (
    type: string,
    chrbot_tag_keys: string,
    nsfw: number,
    order: number,
    page: number,
    paginate: number,
    countryCode: string = 'KR'
  ): Promise<ApiResponse<CharbotSearchResponse>> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/getlist', {
      type,
      chrbot_tag_keys,
      nsfw,
      order,
      page,
      paginate,
      countryCode,
      safety,
    })
  },

  /**
   * 태그 랭킹 리스트
   * @param type 타입 ( 1: 남자, 2: 여자, 3: 모름 )
   */
  GetTagRankingList: async (type: number): Promise<ApiResponse<TagRankingListResponse>> => {
    return api.post('/api/charbot/tagranking/get', {
      type,
    })
  },

  /**
   * 태그 리스트
   */
  GetTagList: async (): Promise<ApiResponse<TagListResponse>> => {
    return api.post('/api/charbot/tag/get')
  },

  /**
   * 피드백 보내기
   * @param content 피드백 내용
   */
  SendFeedback: async (content: string): Promise<ApiResponse<SendFeedbackResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/feedback', {
      content,
    })
  },

  /**
   * 채팅 리스트
   * @param paginate 페이지 당 아이템 수
   * @param page 페이지
   */
  GetChatList: async (paginate: number, page: number): Promise<ApiResponse<CharbotChatListResponse>> => {
    // 토큰 직접 구성
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/chat/list', {
      paginate,
      page,
    })
  },

  /**
   * 채팅 상단 고정
   * @param chrbot_chat_key 채팅 키 ( character 정보 키, world_list_detail_chrbot_key가 아님 )
   * @param fixed 0 이상만 고정 ( 고정 데이터가 2개라면 3 )
   */
  GetChatTopFixed: async (chrbot_chat_key: number, fixed: number): Promise<ApiResponse> => {
    return api.post('/api/charbot/chat/topfixed', {
      chrbot_chat_key,
      fixed,
    })
  },

  /**
   * 검색
   * @param search 검색 키워드
   * @param order 1: 인기순, 2: 최신순
   * @param paginate 페이지 당 아이템 수
   * @param page 페이지
   */
  GetSearch: async (
    search: string,
    order: number,
    paginate: number,
    page: number
  ): Promise<ApiResponse<GetSearchResponse>> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/search', {
      search,
      order,
      paginate,
      page,
      safety,
    })
  },

  /**
   * 닉네임 검색
   * @param target_nick_nm 닉네임
   * @param page 페이지
   * @param paginate 페이지 당 아이템 수
   */
  GetCreateChatBotList: async (
    target_nick_nm: string,
    page: number,
    paginate: number
  ): Promise<ApiResponse<GetSearchResponse>> => {
    const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1
    return api.post('/api/charbot/getlist/user', {
      target_nick_nm,
      page,
      paginate,
      safety,
    })
  },

  /**
   * 캐봇 좋아요
   * @param world_list_detail_chrbot_key 월드 캐봇 키
   */
  CharBotLike: async (world_list_detail_chrbot_key: number): Promise<ApiResponse<CharbotLikeResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/like', {
      world_list_detail_chrbot_key,
    })
  },

  /**
   * 캐봇신고
   * @param report_type 9로 고정
   * @param target_key 캐봇 키
   * @param c_report_key 67
   * @param content 신고 내용
   * @param countryCode 국가 코드 ( KR )
   */
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

  /**
   * 페르소나 이름변경
   * @param persona 페르소나 이름
   * @param persona_gender 페르소나 성별 ( 1: 남자, 2: 여자, 3: 모름 )
   */
  ChangePersonaName: async (
    persona: string,
    persona_gender: number
  ): Promise<ApiResponse<ChangePersonaNameResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/personachange', {
      persona,
      persona_gender,
    })
  },

  /**
   * 캐봇 챗 모드 가져오기
   * @param overrideToken 선택적 토큰 (외부 토큰 초기화 시 사용)
   */
  GetChatMode: async (overrideToken?: string): Promise<ApiResponse<CharbotChatModeResponse>> => {
    const token = overrideToken || useAccountStore.getState().data?.access_token || ''
    const account_token = `Bearer ${token}`
    api.defaults.headers.common['Authorization'] = account_token
    // return api.post('/api/charbot/chatmode')
    return api.post('/api/charbot/chatmode/auth')
  },

  /**
   * 알림 리스트 ( notification )
   * @param page 페이지
   * @param paginate 페이지 당 아이템 수
   */
  GetInquiryList: async (page: number, paginate: number): Promise<ApiResponse<InquiryListResponse>> => {
    return api.post('/api/cs/inquiryList', {
      page,
      paginate,
    })
  },

  /**
   * 은행 리스트
   */
  GetBankList: async (): Promise<ApiResponse<BankListResponse>> => {
    return api.post('/api/banklist')
  },

  /**
   * 이메일 수정
   * @param email 이메일
   */
  WriteRemailEdit: async (email: string): Promise<ApiResponse<WriteRemailEditResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/writeremailedit', {
      email,
    })
  },

  /**
   * 은행 계좌 수정
   * @param bank_key 은행 키 ( 1 ~ n ) number
   * @param account_no 계좌 번호
   * @param user_nm 이름
   */
  WriteRebankAccountEdit: async (
    bank_key: number,
    account_no: string,
    user_nm: string
  ): Promise<ApiResponse<BankAccountEditResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/writerebankaccountedit', {
      bank_key,
      account_no,
      user_nm,
    })
  },

  /**
   * 운영 정책 Url 가져오기
   * @param service_type
   * 0: 이용약관, 1: 유료이용약관, 2: 개인정보처리방침, 3: 운영정책
   * @param countrycode 국가 코드 ( KR )
   * @param os_type 1
   * @param terms_type 1
   */
  ViewTerms: async (
    service_type = 0,
    countrycode = 'KR',
    os_type = 1,
    terms_type: number
  ): Promise<ApiResponse<ViewTermsResponse>> => {
    return api.post('/api/viewterms', {
      service_type,
      countrycode,
      os_type,
      terms_type,
    })
  },

  /* 2025-03-30 추가 */
  // 닉네임 중복 확인
  NicknmCheck: async (nick_nm: string): Promise<ApiResponse> => {
    return api.post('/api/nicknmcheck', {
      nick_nm,
    })
  },

  NicknmCheckToGuest: async (nick_nm: string, access_token: string = ''): Promise<ApiResponse> => {
    const account_token = `Bearer ${access_token}`
    api.defaults.headers.common['Authorization'] = account_token

    return api.post('/api/nicknmcheck', {
      nick_nm,
    })
  },

  // 패스인증
  GetPassInfo: async (success_url: string, failed_url: string, mode = 1): Promise<ApiResponse<GetPassInfoResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/getpassinfo', {
      success_url,
      failed_url,
      mode,
    })
  },

  // 패스인증 성공
  PassSuccess: async (enc_data: string): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/pass/success', {
      enc_data,
    })
  },

  // 패스인증 실패
  PassFailed: async (enc_data: string): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/pass/failed', {
      enc_data,
    })
  },

  // 파일 업로드 전 사전 서명 요청
  GetPresignedUrl: async (
    file_name: string,
    file_type: string,
    type: 5
  ): Promise<ApiResponse<GetPresignedUrlResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/s3/presignedurl', {
      file_name,
      file_type,
      type,
    })
  },

  GetPresignedUrlMulti: async (type: 6, files: any): Promise<ApiResponse<GetPresignedUrlMultiResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('api/s3/presignedurl/multiple', {
      files: JSON.stringify(files),
      type,
    })
  },

  // 닉네임 변경
  NicknmChange: async (nick_nm: string): Promise<ApiResponse<NicknmChangeResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/nicknmchange', {
      nick_nm,
    })
  },

  // 새로운 알림 추가 ( 갱신 )
  NewNotice: async (): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/newnoti')
  },

  // 알림 가져오기
  GetNotice: async (): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/getnoti')
  },

  // naver/get/token
  GetNaverToken: async (code: string, state: string): Promise<ApiResponse> => {
    return api.post('api/naver/get/token', {
      code,
      state,
    })
  },

  // google/get/token
  GetGoogleToken: async (code: string, state: string, redirect_uri: string): Promise<ApiResponse> => {
    return api.post('api/google/get/token', {
      code,
      state,
      redirect_uri,
    })
  },

  // api/apple/get/token
  GetAppleToken: async (code: string, redirect_uri: string): Promise<ApiResponse> => {
    return api.post('api/apple/get/token', {
      code,
      redirect_uri,
    })
  },

  // safety Filter
  SetSafetyMode: async (safety: number): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/safety', {
      safety,
    })
  },

  /**
   * 멀티 이미지 가져오기
   */
  GetMultiImageData: async (
    world_list_detail_chrbot_key: number,
    likeability_yn: number
  ): Promise<ApiResponse<any>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/inprogress/get/multiimagedata', {
      world_list_detail_chrbot_key,
      likeability_yn,
    })
  },

  /**
   * 멀티 이미지 열기
   */
  UnlockMultiImage: async (
    chrbot_chat_key: number,
    chrbot_multi_image_key: number,
    multiImageInfoJson: string
  ): Promise<ApiResponse<UnlockMultiImageResponse>> => {
    // const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    // api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/chat/unlock', {
      chrbot_chat_key,
      chrbot_multi_image_key,
      multiImageInfoJson,
    })
  },

  /**
   * 채팅 이미지 저장
   */
  ChatImageSave: async (
    chrbot_chat_key: number,
    multiImageInfoJson: string,
    img_fixed?: number | 0
  ): Promise<ApiResponse<ChatSaveResponse>> => {
    return api.post('/api/charbot/chat/save', {
      chrbot_chat_key,
      multiImageInfoJson,
      img_fixed,
    })
  },

  /**
   * 호감도 판독기
   */
  ChatLikeability: async (
    requestLikeAbilityData: requestLikeAbilityData
  ): Promise<ApiResponse<ChatLikeabilityResponse>> => {
    // ChatLikeability: async (
    //   world_list_detail_chrbot_key: number,   // 캐봇 키
    //   likeability_yn: number,                 // 호감도 세팅여부 ( 0 : 비활성화, 1 : 활성화 )
    //   likeability_lv: number,                 // 현재 호감도 레벨
    //   chatting_room: string,                  // 채팅방 ID ( ChatChannel.RoomName ex chat_00000_000|000 )
    //   persona: string,                        // 페르소나
    //   character: string,                      // 캐릭터 이름
    //   lv_rules: string,                       // 호감도 레벨 규칙 ( LikeabilityLevelStructure ) {{char}}:캐릭터 이름, {{user}}:유저 페르소나 치환

    // ): Promise<ApiResponse<any>> => {
    return api.post('/api/charbot/chat/likeability', requestLikeAbilityData)
  },

  /**
   * 호감도 판독 후 저장
   * 호감도 판독 후 경험치와 레벨을 변경 후 저장
   */
  ChatLikeabilitySave: async (
    chrbot_chat_key: number,
    likeability_exp: number, // 호감도 판독기에서 받은 경험치 총량
    likeability_lv: number, // 현재 호감도 레벨
    multiImageInfoJson: string // 멀티 이미지 정보 ( ChatbotMultiImageStructure )
  ): Promise<ApiResponse<ChatLikeabilitySaveResponse>> => {
    return api.post('/api/charbot/chat/save', {
      chrbot_chat_key,
      likeability_exp,
      likeability_lv,
      multiImageInfoJson,
    })
  },

  /**
   * 레벨 변경
   */
  ChatLikeabilityLevelChange: async (
    chrbot_chat_key: number, // 채팅방 키
    likeability_lv: number, // 현재 호감도 레벨
    likeability_fixed_lv?: number | 0 // 고정시키고 싶은 레벨, 0이면 고정없음
  ): Promise<ApiResponse<ChatSaveResponse>> => {
    return api.post('/api/charbot/chat/save', {
      chrbot_chat_key,
      likeability_lv,
      likeability_fixed_lv,
    })
  },

  /**
   * 간편 회원가입
   * @param persona 페르소나
   * @param persona_gender 페르소나 성별
   */
  SimpleLogin: async (persona: string, persona_gender: number): Promise<ApiResponse<GuestLoginResponse>> => {
    return api.post('/api/register5', {
      persona,
      persona_gender,
    })
  },
}

// 채팅 API
export const chatApi = {
  /**
   * 펜 사용
   * @param chrbot_chat_key 채팅 키
   * @param chat_mode 채팅 모드 ( 1: 가성비모드, 2: 스토리모드, 3: 짜릿1.0, 4: 짜릿2.0 )
   */
  UseChat: async (chrbot_chat_key: number, chat_mode: number): Promise<ApiResponse<ChatUseResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return chatApiInstance.post('/api/charbot/chat/use', {
      chrbot_chat_key,
      chat_mode,
    })
  },

  /**
   * 채팅방 열기
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   * @param chat_mode 채팅 모드 ( 1: 가성비모드, 2: 스토리모드, 3: 짜릿1.0, 4: 짜릿2.0 )
   * @param nsfw 유저가 성인이면 1, 아니면 0
   */
  OpenChat: async (
    chrbot_chat_key: number,
    chat_mode: number,
    nsfw: number
  ): Promise<ApiResponse<OpenChatResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    chatApiInstance.defaults.headers.common['Authorization'] = account_token
    return chatApiInstance.post('/api/charbot/chat/open', {
      chrbot_chat_key,
      chat_mode,
      nsfw,
    })
  },

  /**
   * 채팅방 닫기
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   */
  CloseChat: async (chrbot_chat_key: number): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    chatApiInstance.defaults.headers.common['Authorization'] = account_token
    return chatApiInstance.post('/api/charbot/chat/close', {
      chrbot_chat_key,
    })
  },

  /**
   * 메세지 전송
   * @param chat_mode 채팅 모드 ( 1: 가성비모드, 2: 스토리모드, 3: 짜릿1.0, 4: 짜릿2.0 )
   * @param nsfw 유저가 성인이면 1, 아니면 0
   * @param prompt_key 프롬프트 키
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   * @param stream 스트리밍 여부 0으로
   */
  SendChat: async (
    chat_mode: number,
    nsfw: number,
    prompt_key: string,
    chrbot_chat_key: number,
    stream: boolean
  ): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/send', {
      chat_mode,
      nsfw: 1,
      prompt_key,
      chrbot_chat_key,
      stream: stream ? 1 : 0,
      countryCode: 'KR',
    })
  },

  /**
   * 메세지 전송
   * @param chat_mode 채팅 모드 ( 1: 가성비모드, 2: 스토리모드, 3: 짜릿1.0, 4: 짜릿2.0 )
   * @param nsfw 유저가 성인이면 1, 아니면 0
   * @param prompt_key 프롬프트 키
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   * @param stream 스트리밍 여부 0으로
   */
  ReSendChat: async (
    chat_mode: number,
    nsfw: number,
    prompt_key: string,
    chrbot_chat_key: number,
    stream: boolean
  ): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/resend', {
      chat_mode,
      nsfw: 1,
      prompt_key,
      chrbot_chat_key,
      stream: stream ? 1 : 0,
      countryCode: 'KR',
    })
  },

  /**
   * 메세지 정렬
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   * @param chat_mode 채팅 모드 ( 1: 가성비모드, 2: 스토리모드, 3: 짜릿1.0, 4: 짜릿2.0 )
   * @param nsfw 유저가 성인이면 1, 아니면 0
   */
  ArrangeChat: async (chrbot_chat_key: number, chat_mode: number, nsfw: number): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/arrange', {
      chrbot_chat_key,
      chat_mode,
      nsfw,
    })
  },

  /**
   * 메세지 요약
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   * @param summary_id 요약 키
   * @param countryCode 국가 코드 ( KR )
   */
  SummaryChat: async (
    chrbot_chat_key: number,
    summary_id: string,
    countryCode: string,
    chat_mode: number
  ): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/summary', {
      chrbot_chat_key,
      summary_id,
      countryCode,
      chat_mode,
    })
  },

  /**
   * 메세지 삭제
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   * @param chat_mode 채팅 모드 ( 1: 가성비모드, 2: 스토리모드, 3: 짜릿1.0, 4: 짜릿2.0 )
   * @param nsfw 유저가 성인이면 1, 아니면 0
   * @param delete_id 삭제 키
   * @param delete_idx 삭제 인덱스 ( x )
   */
  DeleteChat: async (
    chrbot_chat_key: number,
    chat_mode: number,
    nsfw: number,
    delete_id: string
    // delete_idx: number
  ): Promise<ApiResponse> => {
    return chatApiInstance.post('/api/charbot/chat/delete', {
      chrbot_chat_key,
      chat_mode,
      nsfw,
      delete_id,
      // delete_idx,
    })
  },

  /**
   * 채팅방 메세지 초기화
   * @param chrbot_chat_key 채팅 키 ( nakama 에서 채팅 키 추출 )
   * @param chat_mode 채팅 모드 ( 1: 가성비모드, 2: 스토리모드, 3: 짜릿1.0, 4: 짜릿2.0 )
   * @param nsfw 유저가 성인이면 1, 아니면 0
   */
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
  // 월별 수익 내역
  GetMonthlyIncome: async (type: number): Promise<ApiResponse<SaleMonthlyIncomeResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/sales/monthlyIncome_V1', {
      type,
    })
  },

  /**
   * 수익 내역
   * @param type 1: 이달, 2: 전달
   * @param page 페이지
   * @param paginate 페이지 당 아이템 수
   */
  GetSettlementList: async (
    type: number,
    page: number,
    paginate: number
  ): Promise<ApiResponse<SaleMonthlyIncomeListResponse>> => {
    return api.post('/api/sales/monthlyIncomeList_v2', {
      type,
      page,
      paginate,
    })
  },

  // 출금 신청 내역
  GetWithdrawRequestList: async (page: number, paginate: number): Promise<ApiResponse<WithdrawRequestListResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/sales/withdrawrequestList', {
      page,
      paginate,
    })
  },

  /**
   * 주문 아이디 가져오기
   * @param coinKey 아이템 고유키
   */
  GetOrderId: async (coinKey: string): Promise<ApiResponse<OrderIdResponse>> => {
    return api.post('/api/getorderid', {
      coin_key: coinKey,
    })
  },

  /**
   * 코인 리스트
   */
  GetCoinList: async (): Promise<ApiResponse<CoinListResponse>> => {
    return api.post('/api/coinlist')
  },

  /**
   * 코인 사용 내역
   * @param page 페이지
   * @param paginate 페이지 당 아이템 수
   * @param charge_type 0: All ( 합계 ), 121: 가성비모드, 122: 스토리모드, 123: 성인모드 1.0, 124: 성인모드 2.0
   */
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

  /**
   * 토스 결제 확인
   * @param paymentKey 결제 키
   * @param orderId 주문 아이디
   * @param amount 결제 금액
   */
  ConfirmTossPayment: async (
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<ApiResponse<ConfirmTossPaymentResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/web/toss/confirm', {
      paymentKey,
      orderId,
      amount,
    })
  },

  /**
   * 작가 출금 현황
   */
  GetWriterWithdrawStatus: async (): Promise<ApiResponse<WriterWithdrawResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/sales/writerwithdraw')
  },

  /**
   * 작가 출금 신청
   * @param price 출금 금액 ( 출금신청 펜 갯수 )
   * @param locale 0: 국내, 1: 해외
   * @param user_nm 작가 닉네임
   * @param resno1 주민번호 앞자리
   * @param resno2 주민번호 뒷자리
   */
  WithdrawRequest: async (
    price: number,
    locale = 0,
    user_nm: string,
    resno1: string,
    resno2: string
  ): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/sales/withdrawrequest', {
      price,
      locale,
      user_nm,
      resno1,
      resno2,
      encryption: 1,
    })
  },

  /**
   * 출석 보상
   */
  UseFreePen: async (): Promise<ApiResponse<ChatFreePenResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/chat/freepen')
  },
}

// 크리에이트 API ( 캐봇 작성 )
export const createApi = {
  /**
   * 현재 작업중인 캐봇 가져오기
   * @param world_list_detail_chrbot_key 캐봇 키
   */
  GetCreateChatBotInProgress: async (
    world_list_detail_chrbot_key: number | null,
    chat_room_mode?: number
  ): Promise<ApiResponse<CharbotInprogressResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/inprogress/get', {
      world_list_detail_chrbot_key,
      chat_room_mode,
    })
  },

  // 현재 작업중인 캐봇 저장 (FormData 방식)
  SaveInProgressFormData: async (formData: FormData): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    console.log('formData', formData)
    // ✅ FormData 전송을 위한 axios 설정 (Content-Type 제거)
    return api.post('/api/charbot/inprogress/save', formData, {
      headers: {
        Authorization: account_token,
        'X-Web-Access': true,
        'Content-Type': 'multipart/form-data', // ✅ 기본 JSON Content-Type 제거
      },
    })
  },

  /**
   * 멀티 이미지 업로드
   */
  SaveMultiImageData: async (formData: FormData): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/inprogress/save/multiimagedata', formData, {
      headers: {
        Authorization: account_token,
        'X-Web-Access': true,
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 멀티 이미지 삭제
   */

  DeleteMultiImageData: async (chrbot_multi_image_key: number): Promise<ApiResponse> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/charbot/inprogress/delete/multiimagedata', {
      chrbot_multi_image_key,
    })
  },

  /**
   * 태그 저장
   * @param world_list_detail_chrbot_key 캐봇 키
   * @param tags 태그
   * @param c_chrbot_tag_key 태그 키 ( 쉼표로 구분 ex> 1,2,3 )
   */
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

  /**
   * 캐봇 삭제
   * @param world_list_detail_chrbot_key 캐봇 키
   */
  DeleteChatBot: async (world_list_detail_chrbot_key: number): Promise<ApiResponse> => {
    return api.post('/api/charbot/delete', {
      world_list_detail_chrbot_key,
    })
  },

  /**
   * 작성한 캐봇 리스트 ( 로그인 후 )
   * @param target_nick_nm 닉네임
   * @param page 페이지
   * @param paginate 페이지 당 아이템 수
   */
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

  /**
   * 캐봇 상세 정보
   * @param world_list_detail_chrbot_key 캐봇 키
   */
  GetChatBot: async (world_list_detail_chrbot_key: number): Promise<ApiResponse<CharbotResponse>> => {
    return api.post('/api/charbot/get', {
      world_list_detail_chrbot_key,
    })
  },

  /**
   * ?????? 캐봇 인증 ?????? 이런걸 만든기억이 없는데??????
   */
  GetChatBotAuth: async (): Promise<ApiResponse> => {
    return api.post('/api/charbot/get/auth')
  },

  /**
   * 작가 정보
   */
  GetWriterInfo: async (): Promise<ApiResponse<WriterInfoResponse>> => {
    const account_token = `Bearer ${useAccountStore.getState().data?.access_token || ''}`
    api.defaults.headers.common['Authorization'] = account_token
    return api.post('/api/writerinfo')
  },
}

export { setAuthToken, API_URL, CHAT_URL }

export const getWebConfig = async (): Promise<ApiResponse> => {
  const path = 'https://sps-download.s3.ap-northeast-2.amazonaws.com/space_play_en/config/web/config_web.json'
  return axios.get(path)
}

export const getWebNotice = async (): Promise<ApiResponse> => {
  const path = 'https://sps-download.s3.ap-northeast-2.amazonaws.com/space_play_en/contents_config/contents_config.json'
  return axios.get(path)
}
