import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { MultiImageData, ChatbotMultiImageStructure, ChatbotPropertyStructure } from '@/services/interface'
import { useAccountStore } from '@/store/useAccountStore'
import { useChatStore } from '@/store/useChatStore'
import { rijndaelEncrypt } from '@/lib/utils/storyNationUtil'




interface MultiImageStore {
  // 대화방 초기 데이터
  selectedMultiImageData: ChatbotMultiImageStructure

  // 멀티 이미지 데이터
  multiImages: MultiImageData[] | null
  openImageCount: number | 0

  bgImageKey: number
  bgImageUrl: string

  setSelectedMultiImageData: (selectedMultiImageData: string | null, propertyData: string | null) => void
  fetchMultiImages: (world_list_detail_chrbot_key: number, likeability_yn: number) => Promise<void>
  
  unlockMultiImage: (chrbot_multi_image_key: number) => Promise<number | null>
  fetchMultiImageData: (multiImages: MultiImageData[], isInit?: boolean) => Promise<void>
  chatImageSave: (chrbot_chat_key: number, img_fixed?: number | 0) => Promise<void>

  chageBackgroundImage: (img_selected_key: number) => void
  checkOpenImage: (chrbot_multi_image_key: number) => boolean

  // 해금상태 변경
  updateUserMultiImages: (img_unlocked_key: number[]) => void
}



/**
 * 첫 채팅방 입장시 -> setSelectedMultiImageData 데이터 초기화 후
 * 기본 이미지로 세팅
 * 처음 채팅시 이미지 변경?
 */

export const useMultiImageStore = create<MultiImageStore>((set, get) => ({
  propertyData: {
    img_selected_key: 0,
    img_selected_url: '',
    img_public_key: [],
  },
  selectedMultiImageData: {
    img_unlocked_key: [],
    img_selected_key: 0,
    img_fixed: false,
    img_selected_url: '',
  },

  multiImages: null,
  openImageCount: 0,

  bgImageKey: 0,
  bgImageUrl: '',

  setSelectedMultiImageData: (
    selectedMultiImageData: string | null, 
    propertyData: string | null
  ) => {
    try{
      // 초기화
      set({ multiImages: [], openImageCount: 0 })

      // current Selected Image
      if(propertyData) {
        const parsedPropertyData = JSON.parse(propertyData)
        set({
          bgImageKey: parsedPropertyData.img_selected_key,
          bgImageUrl: parsedPropertyData.img_selected_url
        })
      }

      if(selectedMultiImageData) {
        const parsedSelectedMultiImageData = JSON.parse(selectedMultiImageData)
        set({ selectedMultiImageData: parsedSelectedMultiImageData })
        
        if(parsedSelectedMultiImageData) {
          set({
            bgImageKey: parsedSelectedMultiImageData.img_selected_key,
            bgImageUrl: parsedSelectedMultiImageData.img_selected_url
          })
        }
      }
      else {
          set({ selectedMultiImageData: {
            img_unlocked_key: [],
            img_selected_key: 0,
            img_fixed: false,
            img_selected_url: '',
          }})
      }
    }
    catch(error){
        console.error('@@ error :: ' , error)
    }
  },

  
  fetchMultiImages: async (world_list_detail_chrbot_key: number, likeability_yn: number) => {
    try {
      const response = await contentApi.GetMultiImageData(world_list_detail_chrbot_key, likeability_yn)
      if(response.data && response.data.result.err === 0) {
        let multiImages = response.data.multi_image_data
        get().fetchMultiImageData(multiImages, true)
      }
    }
    catch(error){
      console.error('@@ fetchMultiImages error :: ' , error)
    }
  },

  fetchMultiImageData: async (multiImages: MultiImageData[], isInit?: boolean | false) => {
    if(!multiImages || multiImages.length === 0) return

    const imgUnlockedKeys = get().selectedMultiImageData?.img_unlocked_key
    if(imgUnlockedKeys && imgUnlockedKeys.length > 0) {
        imgUnlockedKeys.forEach((key: number) => {
            const index = multiImages.findIndex((item: MultiImageData) => item.chrbot_multi_image_key === key)
            if(index !== -1) {
                multiImages[index].show_yn = 1
            }
        })
    }


    let _openImageCount = 0
    let addDefaultImgDataList = []

    /**
     * 해금 이미지 개수 체크 및 기본이미지 추가( 구 데이터 대응 )
     */
    { // 기본 이미지 추가
      if(isInit) {
        const charbotData = useChatStore.getState().chatBotData
        const addDefaultImgKey = 0
        const addDefaultImgUrl = charbotData?.img_url || ''

        addDefaultImgDataList.push({
          chrbot_multi_image_key: addDefaultImgKey,
          default_yn: 1,
          img_url: addDefaultImgUrl,
          lv: (!multiImages || multiImages.length === 0) ? 0 : multiImages[0].lv,
          show_yn: 1,
        } as MultiImageData)
    
    
        // 성인이미지 추가
        const addNsfwImgKey = Number.MAX_VALUE
        const addNsfwImgUrl = charbotData?.img_url_nsfw || ''
        const addNsfwImgData = {
          chrbot_multi_image_key: addNsfwImgKey,
          default_yn: 1,
          img_url: addNsfwImgUrl,
          lv: (!multiImages || multiImages.length === 0) ? 0 : multiImages[0].lv,
          show_yn: 1,
        } as MultiImageData

        if(!multiImages || multiImages.length === 0) {
          addDefaultImgDataList.push(addNsfwImgData)
        }
      }
    }

    if(multiImages && multiImages.length > 0) {
      _openImageCount = multiImages.filter((item: MultiImageData) => item.show_yn === 1 || item.default_yn === 1).length
    }
    
    set({ multiImages: [...addDefaultImgDataList, ...multiImages] })
    set({ openImageCount: _openImageCount + addDefaultImgDataList.length })
  },

  unlockMultiImage: async (chrbot_multi_image_key: number) => {
    // Rijndael (AES) 암호화 방식으로, 키 길이는 256비트, ECB모드로, 피딩은 PKCS7, 암호화 후 Base64로 인코딩
    const jsonData = JSON.stringify(get().selectedMultiImageData)
    const encrypted = await rijndaelEncrypt(jsonData)

    const response = await contentApi.UnlockMultiImage(useChatStore.getState().chatKey, chrbot_multi_image_key, encrypted)

    if(response.data && response.data.result.err === 0) {
        const { coin, coin_free, coin_free_dt, coin_register } = response.data
        await useAccountStore.getState().updateAccountData(coin_free, coin_free_dt || '', coin_register, coin)

        get().selectedMultiImageData.img_unlocked_key?.push(chrbot_multi_image_key)
        set({ selectedMultiImageData: get().selectedMultiImageData })
        return null
    }
    return response.data.result.err
  },


  chatImageSave: async (chrbot_chat_key: number, img_fixed?: number | 0) => {
    const selectedMultiImage = get().multiImages?.find( find => find.chrbot_multi_image_key === chrbot_chat_key)
    if(!selectedMultiImage) return

    get().selectedMultiImageData.img_selected_url = selectedMultiImage.img_url
    get().selectedMultiImageData.img_selected_key = selectedMultiImage.chrbot_multi_image_key
    get().selectedMultiImageData.img_fixed = img_fixed === 1 ? true : false

    const jsonData = JSON.stringify(get().selectedMultiImageData)
    const encrypted = await rijndaelEncrypt(jsonData)

    const response = await contentApi.ChatImageSave(useChatStore.getState().chatKey, encrypted, img_fixed)
    if(response.data && response.data.result.err === 0) {
      const parsedSelectedMultiImageData = JSON.parse(response.data.chrbot_chat.multi_image || '')
      set({ selectedMultiImageData: parsedSelectedMultiImageData })

      // background Image 업데이트
      if(parsedSelectedMultiImageData) {
        set({
          bgImageKey: parsedSelectedMultiImageData.img_selected_key,
          bgImageUrl: parsedSelectedMultiImageData.img_selected_url
        })
      }
    }
  },

  chageBackgroundImage: (img_selected_key: number) => {
    const selectedMultiImage = get().multiImages?.find( find => find.chrbot_multi_image_key === img_selected_key)
    if(!selectedMultiImage) return

    set({
      bgImageKey: selectedMultiImage.chrbot_multi_image_key,
      bgImageUrl: selectedMultiImage.img_url
    })
  },

  checkOpenImage: (chrbot_multi_image_key: number) => {
    const selectedMultiImage = get().multiImages?.find( find => find.chrbot_multi_image_key === chrbot_multi_image_key)

    // 없으면 열려있음
    if(!selectedMultiImage) {
      console.error('@@ empty image key :: ' , chrbot_multi_image_key)
      return true
    }

    // 있으면 열려있는지 체크
    return (selectedMultiImage?.show_yn === 1 || selectedMultiImage?.default_yn === 1) ? true : false
  },


  updateUserMultiImages: (img_unlocked_key: number[]) => {
    const selectedMultiImage = get().multiImages?.find( find => find.chrbot_multi_image_key === img_unlocked_key[0])

    const existingKeys = get().selectedMultiImageData.img_unlocked_key || [];
    const newKeys = img_unlocked_key.filter(key => !existingKeys.includes(key));

    {
      get().selectedMultiImageData.img_unlocked_key = [...existingKeys, ...newKeys];

      // background image 변경 저장 ( 실제로 변경 changeBackgroundImage 호출 )
      get().selectedMultiImageData.img_selected_url = selectedMultiImage?.img_url || ''
      get().selectedMultiImageData.img_selected_key = selectedMultiImage?.chrbot_multi_image_key || 0
    }
  }
}))
