import { parseConversationExamples, parseExampleJsonToIntroBubbles } from '@/lib/utils/storyNationUtil'
import type {
  CharacterGender,
  CharacterRating,
  CharacterVisibility,
  DmFormValues,
} from '@/src/features/edit-character/model/dmFormTypes'

function getGenderFromNumber(gender: number): CharacterGender {
  if (gender === 1) return 'male'
  if (gender === 2) return 'female'
  if (gender === 3) return 'unspecified'
  return ''
}

export type BridgedCharacterData = DmFormValues

/**
 * 서버에서 받은 inprogress 데이터를 CharacterFormData 형태로 변환
 */
export function bridgeCharacterInProgressToCharacter(data: any): DmFormValues {
  const multiImages = (data.multi_images || []).map((image: any) => ({ ...image }))
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
    world_list_detail_chrbot_key: data.world_list_detail_chrbot_key?.toString() || '',
    name: data.title || '',
    subject: data.subject || '',
    gender: getGenderFromNumber(Number(data.gender)),
    bio: data.intro || '',
    firstMessage: data.first_talk || '',
    content: __content || '',
    content_public: __content_public || '',
    content_show_yn: data.content_show_yn || 0,

    conversationExamples: parseConversationExamples(data.example || ''),
    introBubbles: parseExampleJsonToIntroBubbles(data.first_talk || ''),

    hashtags: data.tags
      ? data.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag !== '')
      : [],

    imgUrl: data.img_url || '',
    imgUrlNsfw: data.img_url_nsfw || '',

    visibility: (data.show_yn === 1 ? 'public' : 'private') as CharacterVisibility,
    examplesVisibility: (data.example_show_yn === 1 ? 'public' : 'private') as CharacterVisibility,
    rating: (data.nsfw === 1 ? 'adult' : 'all') as CharacterRating,

    finish_yn: data.finish_yn || 0,
    writer_note: data.writer_note || '',

    likeabilities: data.likeabilities || [],
    likeability_max_lv: data.likeability_max_lv || 0,
    likeability_yn: data.likeability_yn || 0,
    multi_image_count: data.multi_image_count || 0,
    multi_images: multiImages,
    multi_images_original: multiImages.map((image: any) => ({ ...image })),
    property: data.property || '',
    introActiveSpeaker: 'character',

    chat_room_mode: data.chat_room_mode ?? 0,
    isVisibilityLock: data.finish_yn === 1 && data.show_yn === 1,
  }
}
