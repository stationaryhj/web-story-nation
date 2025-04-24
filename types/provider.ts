export interface Provider {
  id: string;
  name: string;
  logo: string;
  amount: string;
  networkFee: string;
  tag: 'Best' | 'Fastest' | '-0.01%';
  afterNetworkFee: string;
  route: Array<string>;
}


// 서버 설정 데이터 타입 정의
export interface WebConfig {
  ispm: boolean
  pm_period: string
  pm_utc_start: string
  pm_utc_end: string
  pm_desc: string
  pm_desc_ko: string
}

// 프로모션 아이템 타입 정의
export interface PromotionItem {
  key: number
  is_show: boolean
  img_url: string
  img_url_ko?: string
  action_type: number
  link_url: string
  link_url_ko?: string
  path_key: number
  path_key_ko?: number
  world_key: number
  world_key_ko?: number
  notice_data?: {
    title: string
    img_url: string
    link_url: string
    is_btn_on_img: boolean
    txt_btnBottom: string
    color_btnBottom: {
      a: number
      b: number
      g: number
      r: number
    }
    position_btnOnImg: {
      x: number
      y: number
      z: number
    }
  }
}

// 웹 공지 데이터 타입 정의
export interface WebNotice {
  promotions: {
    data: PromotionItem[]
  }
  config: {
    isCheckBeforeWithdraw: boolean
    isShowEnergy: boolean
    isShowAds: boolean
    isShowAdsAllReward: boolean
    isShowAdsGoogleReward: boolean
    isShowAdsUnityReward: boolean
    isShowAdsGoogleNative: boolean
    isShowAdsUnityNative: boolean
    isUnityTestAds: boolean
    isGoogleTestAds: boolean
    isUseGooglePlayGamesLogin: boolean
    isUseFacebookLogin: boolean
    firebaseTopicAdditionCode: number
    er_ai: number
    crt_ai: number
    ai_image_cost: number
    ai_image_cost_free: number
    ai_image_cost_retry: number
    ai_image_cost_retry_free: number
    homeTabVisibility: number
  }
}