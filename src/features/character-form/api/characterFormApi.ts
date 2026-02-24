import { useMutation } from '@tanstack/react-query'
import { instance } from '@/shared/api/instance/instance'
import { apiRoute } from '@/shared/config/apiRoute'
import { exampleDatasToConversationJson } from '@/lib/utils/storyNationUtil'
import type { CharacterFormData, Tag } from '@/features/character-form/model/characterFormStore'
import type { MultiImageData } from '@/services/define'


/**
 * 캐릭터 기본 정보 임시저장
 */
export const useSaveInProgress = () => {
  return useMutation({
    mutationFn: async ({ formData, finishYn = 0 }: { formData: CharacterFormData; finishYn?: number }) => {
      const isLock = formData.finish_yn === 1 && formData.visibility === 'public'

      const payload = {
        world_list_detail_chrbot_key: formData.world_list_detail_chrbot_key || '',
        img_url: formData.imgUrl || '',
        img_url_nsfw: formData.imgUrlNsfw || '',
        title: formData.name || '',
        subject: formData.subject || '',
        gender: formData.gender === 'male' ? 1 : formData.gender === 'female' ? 2 : 0,
        intro: formData.bio || '',
        first_talk: formData.firstMessage || '',
        content: formData.content || '',
        content_public: formData.content_public || '',
        example:
          formData.conversationExamples && formData.conversationExamples.length > 0
            ? JSON.stringify(exampleDatasToConversationJson(formData.conversationExamples))
            : '',
        nsfw: formData.rating === 'adult' ? 1 : 2,
        show_yn: formData.visibility === 'public' ? 1 : 0,
        content_show_yn: 2,
        example_show_yn:
          formData.conversationExamples && formData.conversationExamples.length > 0
            ? formData.examplesVisibility === 'public' ? 1 : 0
            : 0,
        finish_yn: formData.finish_yn ? formData.finish_yn : finishYn,
        likeability_yn: formData.likeability_yn || 0,
        likeabilities: formData.likeabilities || [],
        isVisibilityLock: isLock,
        writer_note: formData.writer_note || '',
      }

      const jsonData = JSON.stringify(payload.likeabilities)
      const pako = require('pako')
      const gzip = pako.gzip(jsonData)
      const imageFile = new File([gzip], 'multiimage.txt', { type: 'application/gzip' })

      const apiFormData = new FormData()
      apiFormData.append('world_list_detail_chrbot_key', payload.world_list_detail_chrbot_key)
      apiFormData.append('content', payload.content)
      apiFormData.append('content_public', payload.content_public)
      apiFormData.append('content_show_yn', payload.content_show_yn.toString())
      apiFormData.append('example', payload.example)
      apiFormData.append('example_show_yn', payload.example_show_yn.toString())
      apiFormData.append('finish_yn', payload.finish_yn.toString())
      apiFormData.append('first_talk', payload.first_talk)
      apiFormData.append('gender', payload.gender.toString())
      apiFormData.append('image', imageFile)
      apiFormData.append('img_url', payload.img_url)
      apiFormData.append('img_url_nsfw', payload.img_url_nsfw)
      apiFormData.append('intro', payload.intro)
      apiFormData.append('likeability_yn', payload.likeability_yn.toString())
      apiFormData.append('nsfw', payload.nsfw.toString())
      apiFormData.append('show_yn', payload.show_yn.toString())
      apiFormData.append('subject', payload.subject)
      apiFormData.append('title', payload.title)
      apiFormData.append('writer_note', payload.writer_note)
      apiFormData.append('countryCode', 'KR')

      const response = await instance.post(apiRoute.charbot.inprogress.save, apiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (!response.data || (response.data.result && response.data.result.err !== 0)) {
        throw new Error(response.data?.result?.msg || '저장에 실패했습니다.')
      }

      return {
        world_list_detail_chrbot_key: response.data?.world_list_detail_chrbot_key?.toString(),
      }
    },
  })
}


/**
 * 멀티이미지 저장 (변경분만 전송)
 */
export const useSaveMultiImages = () => {
  return useMutation({
    mutationFn: async (formData: CharacterFormData): Promise<MultiImageData[] | null> => {
      const changedImages = formData.multi_images.filter(item => {
        const original = formData.multi_images_original.find(orig =>
          orig.idx === item.idx &&
          orig.chrbot_multi_image_key === item.chrbot_multi_image_key &&
          orig.default_yn === item.default_yn &&
          orig.img_url === item.img_url &&
          orig.lv === item.lv &&
          orig.rules === item.rules &&
          orig.show_yn === item.show_yn
        )
        return original === undefined
      })

      const saveDatas = changedImages.map(item => ({
        idx: item.idx || 0,
        chrbot_multi_image_key: item.chrbot_multi_image_key || 0,
        default_yn: item.default_yn,
        img_url: item.img_url,
        lv: item.lv,
        rules: item.rules,
        show_yn: item.show_yn,
        world_list_detail_chrbot_key: Number(formData.world_list_detail_chrbot_key),
      }))

      const jsonData = JSON.stringify(saveDatas)
      const pako = require('pako')
      const gzip = pako.gzip(jsonData)
      const imageFile = new File([gzip], 'multiimage.txt', { type: 'application/gzip' })

      const apiFormData = new FormData()
      apiFormData.append('world_list_detail_chrbot_key', formData.world_list_detail_chrbot_key || '')
      apiFormData.append('likeability_yn', formData.likeability_yn?.toString() || '')
      apiFormData.append('image', imageFile)

      const response = await instance.post(apiRoute.charbot.inprogress.saveMultiImage, apiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (!response.data || (response.data.result && response.data.result.err !== 0)) {
        throw new Error(response.data?.result?.msg || '저장에 실패했습니다.')
      }

      return response.data.multi_image_data || null
    },
  })
}


/**
 * 태그 저장
 */
export const useSaveHashtags = () => {
  return useMutation({
    mutationFn: async ({ formData, availableTags }: { formData: CharacterFormData; availableTags: Tag[] }) => {
      if (!formData.world_list_detail_chrbot_key) {
        throw new Error('캐릭터 ID가 없습니다.')
      }

      const selectedTagKeys = formData.hashtags
        .map(tagName => {
          const tag = availableTags.find(t => t.tag === tagName)
          return tag ? tag.c_chrbot_tag_key : null
        })
        .filter(key => key !== null)
        .join(',')

      const response = await instance.post(apiRoute.charbot.inprogress.saveTag, {
        world_list_detail_chrbot_key: Number(formData.world_list_detail_chrbot_key),
        tags: formData.hashtags.join(','),
        c_chrbot_tag_key: selectedTagKeys,
      })

      if (!response.data || (response.data.result && response.data.result.err !== 0)) {
        throw new Error(response.data?.result?.msg || '태그 저장에 실패했습니다.')
      }
    },
  })
}


/**
 * property 저장
 */
export const useSaveProperty = () => {
  return useMutation({
    mutationFn: async (formData: CharacterFormData) => {
      const firstOpenImages = formData.multi_images.filter(item => item.lv === 0 || item.lv === 1)

      let firstOpenImage = null
      let img_public_keys: number[] = []

      if (firstOpenImages.length > 0) {
        const images = firstOpenImages.filter(item => item.default_yn === 1 || item.show_yn === 1)
        if (images.length > 0) {
          firstOpenImage = images[0]
        }
      }

      if (formData.multi_images.length > 0) {
        img_public_keys = formData.multi_images
          .filter(item =>
            item.show_yn === 1 ||
            (item.default_yn === 1 && item.lv === 0) ||
            (item.default_yn === 1 && item.lv === 1)
          )
          .map(item => item.chrbot_multi_image_key)
      }

      const propertyData = {
        img_selected_key: firstOpenImage?.chrbot_multi_image_key || 0,
        img_selected_url: firstOpenImage?.img_url || '',
        img_public_key: img_public_keys,
      }

      const apiFormData = new FormData()
      apiFormData.append('world_list_detail_chrbot_key', formData.world_list_detail_chrbot_key || '')
      apiFormData.append('property', JSON.stringify(propertyData) || '')

      const response = await instance.post(apiRoute.charbot.inprogress.save, apiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (!response.data || (response.data.result && response.data.result.err !== 0)) {
        throw new Error(response.data?.result?.msg || '저장에 실패했습니다.')
      }
    },
  })
}


/**
 * 멀티이미지 단건 삭제
 */
export const useDeleteMultiImage = () => {
  return useMutation({
    mutationFn: async (chrbot_multi_image_key: number) => {
      if (!chrbot_multi_image_key) return

      const response = await instance.post(apiRoute.charbot.inprogress.deleteMultiImage, {
        chrbot_multi_image_key,
      })

      if (!response.data || (response.data.result && response.data.result.err !== 0)) {
        throw new Error(response.data?.result?.msg || '삭제에 실패했습니다.')
      }
    },
  })
}
