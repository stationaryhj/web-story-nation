// API 응답 기본 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  code?: string;
}


export interface GetUuidResponse {
  clientId: string;
  snsauth: string;
  uuid: string;
  result: ApiResult;
}

// Response Data
// Login
export interface LoginResponse {
  access_token: string;
  cm_user: string;
  coin_free: number;
  coin_free_dt: string;
  coin_register: number;
  coin_user: number;
  di: string;
  energy_user: number;
  exp: number;
  image_url: string;
  ink_user: number;
  lv: number;
  minor: number;
  nick_nm: string;
  parental_chk: number;
  persona: string;
  persona_gender: number;
  profile_url: string;
  sns_type: number;
  token_type: string;
  user_block_type: number;
  user_key: number;
  user_property: string;
  writerchk: number;
  intro?: string;
  result: ApiResult;
}


// Charbot Top 10 List
export type CharbotTop10Response = {
  module_1: Array<ModuleCharacter>;
  module_2: Array<ModuleCharacter>;
  module_3: Array<ModuleCharacter>;
  module_4: Array<ModuleCharacter>;
  module_5: Array<ModuleCharacter>;
  module_6: Array<ModuleCharacter>;
  module_7: Array<ModuleCharacter>;
  result: ApiResult;
};

export type CharbotTop10NewResponse = {
  modules: {
    module_1: Array<ModuleCharacter>;
    module_2: Array<ModuleCharacter>;
    module_3: Array<ModuleCharacter>;
    module_9: Array<ModuleCharacter>;
    module_10: Array<ModuleCreater>;
  }
  
  order: Array<number>;
  result: ApiResult;
};


// Charbot Top 10 Ranking ( Creater )
export type CharbotTop10RankingResponse = {
  result: ApiResult;
  charbot_top10: Array<ModuleCreater>;
}



// Module Character
export interface ModuleCharacter {
  world_list_detail_chrbot_key: number;
  title: string;
  intro: string;
  img_url: string;
  lv: number;
  tags: string;
  chat_cnt: number;
  msg_cnt: number;
  like_cnt: number;
  create_dt: string;
  nick_nm: string;
  nsfw: number;
  module_id: number;
  sort: number;
}

// Module Creater
export interface ModuleCreater {
  intro: string;
  module_id: number;
  module_type: number;
  nick_nm: string;
  profile_url: string;
  user_key: number;
  withdraw_pen: string;
}

export interface TagListResponse {
  result: ApiResult;
  tagList: Array<TagRanking>;
}


// Tag Top Ranking List
export interface TagRankingListResponse {
  result: ApiResult;
  charbot_tag: Array<TagRanking>;
}

export interface TagRanking {
  c_chrbot_tag_key: number;
  group: number;
  sort: number;
  tag: string;
}

// Charbot List
export interface CharbotListResponse {
  current_page: number;
  data: Array<CharbotData>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
  result: ApiResult;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface CharbotData {
  chat_cnt: number;
  create_dt: string;
  img_url: string;
  intro: string;
  like_cnt: number;
  lv: number;
  msg_cnt: number;
  nick_nm: string;
  nsfw: number;
  tags: string;
  title: string;
  world_list_detail_chrbot_key: number;
}

// Charbot Response
export interface CharbotResponse {
  chrbot: ChrbotData;
  result: ApiResult;
}

export interface ChrbotData {
  block_type: number;
  chat_cnt: number;
  comment_cnt: number;
  content: string;
  content_show_yn: number;
  countryCode: string;
  create_dt: string;
  delete_yn: number;
  example: string;
  example_show_yn: number;
  finish_yn: number;
  first_talk: string;
  gender: string;
  img_url: string;
  img_url_nsfw: string;
  intro: string;
  like_cnt: number;
  lv: number;
  msg_cnt: number;
  nick_nm: string;
  nsfw: number;
  show_yn: number;
  sort: number;
  tags: string;
  title: string;
  update_dt: string;
  user_key: number;
  world_key: number;
  world_list_detail_chrbot_key: number;
  world_list_detail_key: number;
}


export interface CharbotChatListResponse {
  chrbot_chat: CharbotChatListData,
  result: ApiResult;
}

export interface CharbotChatListData {
  current_page: number;
  data: Array<CharbotChatData>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface CharbotChatData {
  block_type: number;
  chrbot_chat_key: number;
  fixed: number;
  img_url: string;
  last_msg: string;
  nsfw: number;
  title: string;
  world_list_detail_chrbot_key: number;
}

// Charbot Chat Mode Response
export interface CharbotChatModeResponse {
  chat_mode: Array<ChatModeData>;
  result: ApiResult;
}

export interface ChatModeData {
  chat_mode: number;
  coin: number;
  discount: number;
  original_coin: number;
}

// CharbotGetList Response
export interface CharbotGetListResponse {
  current_page: number;
  data: Array<CharbotData>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
  result: ApiResult;
}


// CharbotGetListMine Response
export interface CharbotGetListMineResponse {
  chrbotList: CharbotGetListMineData;
  result: ApiResult;
}


export interface CharbotGetListMineData {
  current_page: number;
  data: Array<CharbotMineData>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
  result: ApiResult;
}

export interface CharbotMineData {
  block_type: number;
  chat_cnt: number;
  create_dt: string;
  finish_yn: number;
  img_url: string;
  intro: string;
  like_cnt: number;
  msg_cnt: number;
  nsfw: number;
  show_yn: number;
  tags: string;
  title: string;
  world_list_detail_chrbot_key: number;
}

// Charbot Inprogress Response
export interface CharbotInprogressResponse {
  chrbot: CharbotInprogressData;
  charbot_tag: Array<CharbotTagData>;
  result: ApiResult;
}

export interface CharbotInprogressData {
  block_type: number;
  chat_cnt: number;
  comment_cnt: number;
  content: string;
  content_show_yn: number;
  countryCode: string;
  create_dt: string;
  delete_yn: number;
  example: string;
  example_show_yn: number;
  finish_yn: number;
  first_talk: string;
  gender: string;
  img_url: string;
  img_url_nsfw: string;
  intro: string;
  like_cnt: number;
  msg_cnt: number;
  nsfw: number;
  show_yn: number;
  sort: number;
  tags: string;
  title: string;
  update_dt: string;
  user_key: number;
  world_key: number;
  world_list_detail_chrbot_key: number;
  world_list_detail_key: number;
}

export interface CharbotTagData {
  c_chrbot_tag_key: number;
  chrbot_tag_key: number;
  create_dt: string;
  tag: string;
  world_list_detail_chrbot_key: number;
}

// SaleMonthlyIncomeResponse
export interface SaleMonthlyIncomeResponse {
  monthlyIncome: number;
  result: ApiResult;
}




// SaleMonthlyIncomeList Response
export interface SaleMonthlyIncomeListResponse {
  IncomeList: IncomeList;
  result: ApiResult;
}

export interface IncomeList {
  current_page: number;
  data: Array<IncomeData>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface IncomeData {
  cnt: number;
  content: string;
  create_dt: string;
  pen: string;
  title: string;
}


// CharbotLike Response
export interface CharbotLikeResponse {
  like_cnt: number;
  result: ApiResult;
  status: number;
}

// ReportAdd Response
export interface ReportAddResponse {
  report_exist: number;
  result: ApiResult;
}

// CharbotSearch Response
export interface CharbotSearchResponse {
  chrbotList: CharbotSearchData;
  result: ApiResult;
}

export interface CharbotSearchData {
  current_page: number;
  data: Array<CharbotData>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// GetOrderId Response
export interface OrderIdResponse {
  orderId: string;
  toss_client_key: string;
  result: ApiResult;
}

// CoinData Response
export interface CoinListResponse {
  coinList: Array<CoinData>;
  result: ApiResult;
}

export interface CoinData {
  coin_key: number;
  coin_type: number;
  coin_nm: string;
  img_url: string;
  content: string;
  cnt: number;
  price: number;
  sort: number;
}


// CoinChargeUseHistory Response
export interface CoinChargeUseHistoryResponse {
  historyList: CoinChargeUseHistoryData;
  result: ApiResult;
}

export interface CoinChargeUseHistoryData {
  current_page: number;
  data: Array<UseHistoryData>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface UseHistoryData {
  charge_type: number;
  coin: number;
  content: string;
  create_dt: string;
  item_key: any;
  property: string;
}

// Use Coin Response
export interface ChatUseResponse {
  coin: number,
  coin_free: number,
  coin_free_dt: string,
  coin_register: number,
  charge_use_key: number,
  result: ApiResult;
}

// ConfirmTossPayment Response
export interface ConfirmTossPaymentResponse {
  coin_user: number;
  coin_free: number;
  coin_register: number;
  result: ApiResult;
}


// ChatMessageResponse
export interface ChatMessageResponse {
  msg_len: number;
  prompt_key: string;
  response: string;
  summary_position: number
  result: ApiResult;
}


export interface OpenChatResponse {
  arrangePrompt: number
  prompt_key: string
  world_list_detail_chrbot: WorldListDetailChrbot;
  result: ApiResult
}


export interface WorldListDetailChrbot {
  block_type: number
  chat_cnt: number
  comment_cnt: number
  delete_yn: number
  first_talk: string
  gender: string
  img_url: string
  img_url_nsfw: string
  like_cnt: number
  lv: number
  msg_cnt: number
  nick_nm: string
  nsfw: number
  tags: string
  title: string
  user_key: number
  world_list_detail_chrbot_key: number
}


// InquiryList Response
export interface InquiryListResponse {
  notice: {
    current_page: number;
    data: Array<InquiryData>;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<PaginationLink>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
    result: ApiResult;
  }
}

// Inquiry Data
export interface InquiryData {
  notice_key: number
  title: string
  content: string
  sort: number
  create_dt: string
}

// BankList Response
export interface BankListResponse {
  bank_list: Array<BankData>;
  result: ApiResult;
}

export interface BankData {
  bank_key: number
  bank_nm: string
  img_url: string
  sort: number
}

// WriteRemailEdit Response
export interface WriteRemailEditResponse {
  result: ApiResult;
}


// BankAccountEdit Response
export interface BankAccountEditResponse {
  result: ApiResult;
}

// ChangePersonaName Response
export interface ChangePersonaNameResponse {
  result: ApiResult;
}

// ViewTerms Response
export interface ViewTermsResponse {
  result: ApiResult;
  URL: string;
}


// SendFeedback Response
export interface SendFeedbackResponse {
  result: ApiResult;
}

// WriterInfo Response
export interface WriterInfoResponse {
  result: ApiResult;
  book_writer: WriterInfoData;
}

export interface WriterInfoData {
  account_no: string;
  bank_nm: string;
  cellphone: string;
  email: string;
  user_key: number;
  user_nm: string;
}

// WriterWithdraw Response
export interface WriterWithdrawResponse {
  result: ApiResult;
  withdraw: number;
  withdraw_pen: number;
  allow: number;
}

// GetPassInfo Response
export interface GetPassInfoResponse {
  enc_data: string;
  result: ApiResult;
  returnMsg: string;
}

// GetPresignedUrl Response
export interface GetPresignedUrlResponse {
  result: ApiResult;
  path: string;
  presignedUrl: string;
}


// WithdrawRequestListResponse
export interface WithdrawRequestListResponse {
  result: {
    err: number
    msg: string
  }
  withdrawrequest: {
    current_page: number
    data: WithdrawRequestItem[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: string
    prev_page_url: string | null
    to: number
    total: number
  }
  sum_price: string
}

export interface WithdrawRequestItem {
  withdraw_request_key: number
  price: number
  pen: number
  create_dt: string
}

// register4 Response
export interface Register4Response {
  access_token: string;
  nick_nm: string;
  snsaccesstoken: string;
  token_type: string;
  result: ApiResult;
}

// API Result
export type ApiResult = {
  err: number;
  msg: string;
};

// 소셜 로그인 관련 상수
export const SocialLoginTypes = {
  KAKAO: {
    id: 1,
    name: 'kakao',
  },
  NAVER: {
    id: 2,
    name: 'naver',
  },
  GOOGLE: {
    id: 3,
    name: 'google',
  },
  APPLE: {
    id: 4,
    name: 'apple',
  },
} as const;

export type SocialLoginType = typeof SocialLoginTypes[keyof typeof SocialLoginTypes];
