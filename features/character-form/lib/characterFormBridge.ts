import type { CharacterGender } from '@/store/useCreateCharacterData'
import { parseConversationExamples } from '@/lib/utils/storyNationUtil'

function getGenderFromNumber(gender: number): CharacterGender {
  if (gender === 1) return 'male'
  if (gender === 2) return 'female'
  return 'unspecified'
}

/**
 * 서버에서 받은 inprogress 데이터를 CharacterFormData 형태로 변환
 */
export function bridgeCharacterInProgressToCharacter(data: any) {
  let __content = ''
  let __content_public = ''

  if (data.content_show_yn === 2) {
    if (data.content_public) __content_public = data.content_public
    if (data.content) __content = data.content
  } else {
    if (data.content_show_yn === 1) {
      __content_public = data.content
    } else {
      __content = data.content
    }
  }

  return {
    id: data.world_list_detail_chrbot_key?.toString() || '',
    name: data.title || '',
    subject: data.subject || '',
    gender: getGenderFromNumber(Number(data.gender)),
    bio: data.intro || '',
    firstMessage: data.first_talk || '',
    content: __content || '',
    content_public: __content_public || '',
    content_show_yn: data.content_show_yn || 0,

    conversationExamples: parseConversationExamples(data.example || ''),

    hashtags: data.tags
      ? data.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag !== '')
      : [],

    img_url: data.img_url || '',
    img_url_nsfw: data.img_url_nsfw || '',
    img_web_url: data.img_web_url || '',

    visibility: data.show_yn === 1 ? 'public' : 'private',
    examplesVisibility: data.example_show_yn === 1 ? 'public' : 'private',
    rating: data.nsfw === 1 ? 'adult' : 'all',

    finish_yn: data.finish_yn || 0,
    writer_note: data.writer_note || '',

    likeabilities: data.likeabilities || [],
    likeability_max_lv: data.likeability_max_lv || 0,
    likeability_yn: data.likeability_yn || 0,
    multi_image_count: data.multi_image_count || 0,
    multi_images: data.multi_images || [],
    multi_images_original: data.multi_images || [],
    property: data.property || '',

    isVisibilityLock: data.finish_yn === 1 && data.show_yn === 1,
  }
}
