import type { IntroBubbleGroup, exampleDatas } from '@/lib/utils/storyNationUtil'
import type { LikeAbilityData, MultiImageData } from '@/services/define'

export type CharacterGender = 'male' | 'female' | 'unspecified'
export type CharacterVisibility = 'public' | 'private'
export type CharacterRating = 'all' | 'adult'
export type DmSpeaker = IntroBubbleGroup['speaker']
export type DmMultiImage = MultiImageData

export interface DmFormValues {
  world_list_detail_chrbot_key: string
  name: string
  subject: string
  gender: CharacterGender
  visibility: CharacterVisibility
  examplesVisibility: CharacterVisibility
  rating: CharacterRating
  bio: string
  imgUrl: string
  imgUrlNsfw: string
  introBubbles: IntroBubbleGroup[]
  introActiveSpeaker: DmSpeaker
  conversationExamples: exampleDatas[]
  hashtags: string[]
  multi_images: DmMultiImage[]
  multi_images_original: DmMultiImage[]
  finish_yn: number
  likeability_yn: number
  likeabilities: LikeAbilityData[]
  likeability_max_lv: number
  multi_image_count: number
  writer_note: string
  content: string
  content_public: string
  content_show_yn: number
  firstMessage: string
  property: string
  chat_room_mode: number
  isVisibilityLock: boolean
}

export interface SaveMultiImagesPayload {
  world_list_detail_chrbot_key: string
  likeability_yn: number
  multi_images: DmMultiImage[]
  multi_images_original: DmMultiImage[]
}

export type DmSavePayload = Pick<
  DmFormValues,
  | 'world_list_detail_chrbot_key'
  | 'name'
  | 'subject'
  | 'gender'
  | 'visibility'
  | 'examplesVisibility'
  | 'rating'
  | 'bio'
  | 'imgUrl'
  | 'imgUrlNsfw'
  | 'introBubbles'
  | 'conversationExamples'
  | 'finish_yn'
  | 'likeability_yn'
  | 'likeabilities'
  | 'writer_note'
  | 'content'
  | 'content_public'
  | 'content_show_yn'
  | 'firstMessage'
>

export const defaultDmFormValues: DmFormValues = {
  world_list_detail_chrbot_key: '',
  name: '',
  subject: '',
  gender: 'unspecified',
  visibility: 'private',
  examplesVisibility: 'private',
  rating: 'all',
  bio: '',
  imgUrl: '',
  imgUrlNsfw: '',
  introBubbles: [],
  introActiveSpeaker: 'character',
  conversationExamples: [],
  hashtags: [],
  multi_images: [],
  multi_images_original: [],
  finish_yn: 0,
  likeability_yn: 0,
  likeabilities: [],
  likeability_max_lv: 0,
  multi_image_count: 0,
  writer_note: '',
  content: '',
  content_public: '',
  content_show_yn: 0,
  firstMessage: '',
  property: '',
  chat_room_mode: 0,
  isVisibilityLock: false,
}
