import type { CharacterFormData } from '@/store/useCreateCharacterData'

type TabType = 'basic' | 'detail' | 'image' | 'last'

/**
 * 현재 탭 기준으로 다음 탭으로 이동 가능한지 유효성 검사
 * - 이전 탭으로 가는 경우는 항상 통과
 */
export function checkValidData(
  formData: CharacterFormData,
  currentTab: TabType,
  nextTab: TabType,
): boolean {
  switch (currentTab) {
    case 'basic': {
      if (formData.imgUrl === '') return false
      if (formData.name.trim() === '') return false
      if (formData.bio.trim() === '') return false
      if (formData.firstMessage.trim() === '') return false
      if (formData.hashtags.length === 0) return false
      break
    }

    case 'detail': {
      if (nextTab === 'basic') return true

      if (formData.likeability_yn === 1) {
        if (formData.likeabilities && formData.likeabilities.length !== 0) {
          for (const item of formData.likeabilities) {
            if (item.lv_name.trim() === '') return false
            if (item.features.trim() === '') return false
            if (item.rules.trim() === '') return false
          }
        }
      }
      break
    }

    case 'image': {
      if (nextTab === 'basic') return true
      if (nextTab === 'detail') return true

      if (formData.multi_images.length !== 0) {
        const checkImages = formData.likeability_yn === 1
          ? formData.multi_images.filter(item => item.lv > 0)
          : formData.multi_images.filter(item => item.lv === 0)

        for (const item of checkImages) {
          if (item.default_yn !== 1) {
            if (item.img_url.trim() !== '' && item.rules.trim() === '') {
              return false
            }
          }
        }
      }
      break
    }
  }

  return true
}

/**
 * 이미지 탭 기준 전체 폼 유효성 검사
 */
export function isFormValid(
  formData: CharacterFormData,
  tab: TabType,
): boolean {
  if (tab === 'image') {
    const basicInfoValid = !!(
      formData.name?.trim() &&
      formData.bio?.trim() &&
      formData.firstMessage?.trim() &&
      formData.hashtags.length > 0
    )

    if (formData.rating === 'adult') {
      return !!(basicInfoValid && formData.imgUrl?.trim() && formData.imgUrlNsfw?.trim())
    } else {
      return !!(basicInfoValid && formData.imgUrl?.trim())
    }
  }

  return true
}
