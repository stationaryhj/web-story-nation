import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { contentApi, createApi } from '@/services/api'
import { useAccountStore } from '@/store/useAccountStore'
import { useMultiImageStore } from './useMultiImageStore'
import { ChrbotData, LikeabilityRuleStructure, ApiResult } from '@/types/api'
import { ChatLikeabilityData } from '@/services/interface'
import { rijndaelEncrypt } from '@/lib/utils/storyNationUtil'

interface ChatStoreData {
	chatKey: number
	isLoading: boolean
	error: Error | null

	chatBotData: ChrbotData | null

	// likeability 관련
	selectedLikeability_exp: number
	selectedLikeability_lv: number
	selectedLikeability_yn: number
	selectedLikeability_lv_rules: LikeabilityRuleStructure[] | null
	selectedLikeability_data: ChatLikeabilityData | null

	setLikeAbility_lv: (chatKey: number, likeability_yn: number, likeability_lv: number, lv_rules: any) => void

	fetchChatBotData: (world_list_detail_chrbot_key: number) => Promise<void>
	chatLikeability: (chatting_room: string) => Promise<ApiResult | null>
	chatLikeabilitySave: (_likeability_exp: number) => Promise<void>
}


interface ParsedData {
	image: number;
	affection: number;
  }
  

const dataParser = (rawData: string | any): ParsedData => {
	try {
	  const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
	  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
	  if (!text) {
		console.warn('No valid text data found');
		return {
		  image: 0,
		  affection: 0
		};
	  }
  
	  // 정규식 패턴 수정: + 기호도 포함하도록
	  const imageMatch = text.match(/\[IMAGE\]\s*(\d+)/);
	  const affectionMatch = text.match(/\[AFFECTION\]\s*([+-]?\d+)/);  // [+-]? 추가
  
	  // 디버깅을 위한 로그
	  console.log('Matches:', { 
		imageMatch: imageMatch?.[1], 
		affectionMatch: affectionMatch?.[1] 
	  });
  
	  const image = imageMatch?.[1] ? parseInt(imageMatch[1]) : 0;
	  const affection = affectionMatch?.[1] ? parseInt(affectionMatch[1]) : 0;
  
	  return {
		image,
		affection
	  };
	} catch (error) {
	  console.error('Data parsing error:', error);
	  return {
		image: 0,
		affection: 0
	  };
	}
};

export const useChatStore = create<ChatStoreData>()(
	persist(
		(set, get) => ({
			chatKey: 0,
			isLoading: false,
			error: null,
			chatBotData: null,
			
			selectedLikeability_exp: 0,
			selectedLikeability_lv: 0,
			selectedLikeability_yn: 0,
			selectedLikeability_lv_rules: null,
			selectedLikeability_data: null,

			fetchChatBotData: async (world_list_detail_chrbot_key: number) => {
				set({ isLoading: true })
				const response = await createApi.GetChatBot(world_list_detail_chrbot_key)
				set({ isLoading: false })
		
				if (response.data && response.data.result && response.data.result.err === 0) {
					set({ chatBotData: response.data.chrbot })
				}
				else {
					set({ error: response.data?.result?.msg as unknown as Error })
				}
			},

			setLikeAbility_lv: (chatKey: number, likeability_yn: number, likeability_lv: number, lv_rules: LikeabilityRuleStructure[] | null) => {
				set({
					chatKey: chatKey,
					selectedLikeability_lv: likeability_lv,
					selectedLikeability_yn: likeability_yn,
					selectedLikeability_lv_rules: lv_rules
				})
			},

			chatLikeability: async (chatting_room: string) => {
				let result = {
					err: 0,
					msg: ''
				}
				if(!chatting_room) return result
				
				const chatBotData = get().chatBotData
				const persona = useAccountStore.getState().data?.persona || ''
				const lv_rules = get().selectedLikeability_lv_rules?.find( find => find.lv === get().selectedLikeability_lv) || null

				if(chatBotData) {
					const response = await contentApi.ChatLikeability({
						world_list_detail_chrbot_key: chatBotData.world_list_detail_chrbot_key,
						likeability_yn: get().selectedLikeability_yn,
						likeability_lv: get().selectedLikeability_lv,
						chatting_room: chatting_room,
						persona: persona,
						character: chatBotData.title,
						lv_rules: JSON.stringify(lv_rules)
					})

					if(response.data.result.err !== 0) {
						result = {
							err: response.data.result.err,
							msg: response.data.result.msg
						}
						return result
					}

					if (response.data && response.data.result && response.data.result.err === 0) {
						const multiImageData = useMultiImageStore.getState().multiImages
						const parsedData = dataParser(response.data.response)

						if(multiImageData) {
							const isUnlockAction = useMultiImageStore.getState().checkOpenImage(parsedData.image) === false
						
							// 여기엔서 이미지 해금 + 변경
							if(parsedData.image > 0) {
								if(isUnlockAction) {
									result = {
										err: 0,
										msg: multiImageData?.find( find => find.chrbot_multi_image_key === parsedData.image)?.img_url || ''
									}
								}
	
								// 이미지 변경
								// await useMultiImageStore.getState().chageBackgroundImage(parsedData.image)
							}
	
							// 상태 저장
							useMultiImageStore.getState().updateUserMultiImages([parsedData.image])
							await useMultiImageStore.getState().fetchMultiImageData(multiImageData)
						}

						// 서버에 저장
						await get().chatLikeabilitySave(parsedData.affection)
					}
					else {
						result = {
							err: response.data.result.err,
							msg: response.data.result.msg
						}
					}
				}

				return result
			},

			chatLikeabilitySave: async (_likeability_exp: number) => {
				const chatKey = get().chatKey
				const likeability_lv = get().selectedLikeability_lv

				const jsonData = JSON.stringify(useMultiImageStore.getState().selectedMultiImageData)
				const encrypted = await rijndaelEncrypt(jsonData)

				const result = await contentApi.ChatLikeabilitySave(
					chatKey,
					_likeability_exp,
					likeability_lv,
					encrypted
				)
				if(result.data && result.data.result && result.data.result.err === 0) {
					set({ selectedLikeability_data: result.data.chrbot_chat })
				}
			}
		}),
		{
			name: 'chat-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
)