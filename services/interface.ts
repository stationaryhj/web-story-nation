import { LikeabilityRuleStructure } from "@/types/api"


export interface MultiImageData {
    chrbot_multi_image_key: number
    default_yn: number
    img_url: string
    lv: number
    show_yn: number
}



export interface ChatbotPropertyStructure {
    img_selected_key: number
    img_selected_url: string
    img_public_key: number[]
}


export interface ChatbotMultiImageStructure {
    img_unlocked_key?: number[]
    img_selected_key?: number
    img_fixed?: boolean
    img_selected_url?: string
}


export interface ChatImageSaveRequest extends ChatLikeabilityData {}


export interface requestLikeAbilityData {
	world_list_detail_chrbot_key: number,   // 캐봇 키
    likeability_yn: number,                 // 호감도 세팅여부 ( 0 : 비활성화, 1 : 활성화 )  
    likeability_lv: number,                 // 현재 호감도 레벨
    chatting_room: string,                  // 채팅방 ID ( ChatChannel.RoomName ex chat_00000_000|000 )
    persona: string,                        // 페르소나
    character: string,                      // 캐릭터 이름
    lv_rules: string | null,                // 호감도 레벨 규칙 ( LikeabilityLevelStructure ) {{char}}:캐릭터 이름, {{user}}:유저 페르소나 치환
}


export interface ChatLikeabilityData {
    likeability_exp?: number | 0
    likeability_fixed_lv?: number | 0
    likeability_lv: number | 0
    likeability_reached_lv: number | 0
    multi_image?: string | null
}



export interface requestConnectedChatRoomData {
	api_server: string
	chat_address: string
	chat_server: string
	chat_server_port: string
	chrbotKey: string
	coin: string
	country_code: string //국가 코드
	freeCoin: string //무료 코인 보유량
	info: any
	nsfw: string
	persona: string
	token: string
	userKey: string
}