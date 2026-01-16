import { faPiggyBank, faBookOpen, faFire, faRocket } from '@fortawesome/free-solid-svg-icons'
import { ChatMode } from '@/components/modal/ChatModeModal'

export interface LikeAbilityData {
	features: string
	lv: number
	lv_name: string
	rules: string
	world_list_detail_chrbot_key: number
}


export interface PriSignedUrlInfo {
	idx: number
	file_name: string
	file_type: string
}


export interface MultiImageData {
	hash?: string
	isDeleteCondition?: boolean
	
	idx: number
	chrbot_multi_image_key: number
	default_yn: number
	img_url: string
	lv: number
	rules: string
	show_yn: number
	world_list_detail_chrbot_key: number
}


export interface MultiImageDataCustom extends MultiImageData {
	hash?: string
	isDeleteCondition?: boolean
}



export const defaultNames: Record<number, string> = {
	1: '가성비 모드',
	2: '스토리 모드',
	3: '짜릿모드 1.0',
	4: '짜릿모드 2.0',
}



export const customChatModes: ChatMode[] = [
	{
	  id: 1,
	  name: '가성비모드',
	  description: '일반적인 대화에 최적화된 모드입니다.',
	  penCost: 1,
	  ai: 'Gemini 1.5 Flash',
	  icon: faPiggyBank,
	  discount: 0,
	  original_coin: 0,
	  isShow: true,
	  isAdult: false,
	},
	{
	  id: 2,
	  name: '스토리모드',
	  description: '이야기 생성과 연속성이 필요한 대화에 적합합니다.',
	  penCost: 3,
	  ai: 'Sonnet 3.5 v2',
	  icon: faBookOpen,
	  discount: 0,
	  original_coin: 0,
	  isShow: true,
	  isAdult: false,
	},
	{
	  id: 3,
	  name: '짜릿모드 1.0',
	  description: '보다 자유롭고 창의적인 대화를 원할 때 사용하세요.',
	  penCost: 4,
	  ai: 'Gemini 1.5 Pro',
	  icon: faFire,
	  discount: 0,
	  original_coin: 0,
	  isShow: true,
	  isAdult: true,
	},
	{
	  id: 4,
	  name: '짜릿모드 2.0',
	  description: '가장 높은 품질과 창의성을 제공하는 최고급 모드입니다.',
	  penCost: 7,
	  ai: 'Sonnet 3.5 v2',
	  icon: faRocket,
	  discount: 0,
	  original_coin: 0,
	  isShow: true,
	  isAdult: true,
	},
]



export const MESSAGES_PER_VIEW = 20
export const LOAD_MORE_THRESHOLD = 500 // 스크롤 임계값 증가
export const LOAD_MORE_COUNT = 15 // 한 번에 로드할 메시지 수 증가
export const PRELOAD_BUFFER = 10 // 미리 로드할 메시지 버퍼