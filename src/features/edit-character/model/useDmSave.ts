import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { UseFormReturn } from 'react-hook-form'
import type { CharacterFormData } from '@/features/edit-character/model/characterFormStore'
import type { IntroBubbleGroup } from '@/lib/utils/storyNationUtil'
import type {
  DmFormValues,
  DmMultiImage,
  DmSavePayload,
  SaveMultiImagesPayload,
} from '@/features/edit-character/model/dmFormTypes'
import { useTagList } from '@/shared/api/queries/useTagList'
import useModalStore from '@/shared/model/stores/useModalStore'
import { useSaveHashtags, useSaveInProgress, useSaveMultiImages, useSaveProperty } from '../api/dmCharacterApi'

/** 인트로 버블에서 참조되는 이미지 토큰을 추출 (숫자 키 + hash) */
function getIntroImageTokens(introBubbles: IntroBubbleGroup[]): { keys: Set<number>; hashes: Set<string> } {
  const keys = new Set<number>()
  const hashes = new Set<string>()
  for (const group of introBubbles) {
    for (const msg of group.messages) {
      const numMatch = msg.text.match(/^\[(\d+)\]$/)
      if (numMatch) {
        keys.add(Number(numMatch[1]))
        continue
      }
      const hashMatch = msg.text.match(/^\[hash:([^\]]+)\]$/)
      if (hashMatch) {
        hashes.add(hashMatch[1])
      }
    }
  }
  return { keys, hashes }
}

function createMultiImagePayload(formData: DmFormValues): SaveMultiImagesPayload {
  const { keys, hashes } = getIntroImageTokens(formData.introBubbles)

  const multi_images = formData.multi_images.map(img => {
    const isReferenced =
      keys.has(img.chrbot_multi_image_key) || (img.hash && hashes.has(img.hash))
    if (isReferenced) {
      return { ...img, show_yn: 1 }
    }
    return img
  })

  return {
    world_list_detail_chrbot_key: formData.world_list_detail_chrbot_key,
    likeability_yn: formData.likeability_yn,
    multi_images,
    multi_images_original: formData.multi_images_original,
  }
}

function createSavePayload(formData: DmFormValues): DmSavePayload {
  return {
    world_list_detail_chrbot_key: formData.world_list_detail_chrbot_key,
    name: formData.name,
    subject: formData.subject,
    gender: formData.gender,
    visibility: formData.visibility,
    examplesVisibility: formData.examplesVisibility,
    rating: formData.rating,
    bio: formData.bio,
    imgUrl: formData.imgUrl,
    imgUrlNsfw: formData.imgUrlNsfw,
    introBubbles: formData.introBubbles,
    conversationExamples: formData.conversationExamples,
    finish_yn: formData.finish_yn,
    likeability_yn: formData.likeability_yn,
    likeabilities: formData.likeabilities,
    writer_note: formData.writer_note,
    content: formData.content,
    content_public: formData.content_public,
    content_show_yn: formData.content_show_yn,
    firstMessage: formData.firstMessage,
  }
}

function syncMultiImageSnapshot(methods: UseFormReturn<DmFormValues>, serverImages: DmMultiImage[] | null) {
  const currentImages = methods.getValues('multi_images')
  let nextImages: DmMultiImage[] = currentImages

  if (serverImages && serverImages.length > 0) {
    nextImages = currentImages.map(image => {
      if (image.chrbot_multi_image_key !== 0) return image

      const matched = serverImages.find(
        serverImage =>
          serverImage.idx === image.idx &&
          serverImage.lv === image.lv &&
          serverImage.img_url === image.img_url &&
          serverImage.rules === image.rules
      )

      return matched ? { ...image, chrbot_multi_image_key: matched.chrbot_multi_image_key } : image
    })

    methods.setValue('multi_images', nextImages, { shouldDirty: false })
  }

  const introBubbles = methods.getValues('introBubbles')
  const nextIntroBubbles = introBubbles.map(group => ({
    ...group,
    messages: group.messages.map(message => {
      const matched = currentImages.find(image => message.text === `[hash:${image.hash}]`)
      if (!matched) return message

      const savedImage = nextImages.find(image => image.hash === matched.hash && image.chrbot_multi_image_key > 0)
      if (!savedImage) return message

      return {
        ...message,
        text: `[${savedImage.chrbot_multi_image_key}]`,
      }
    }),
  })) as IntroBubbleGroup[]

  methods.setValue('introBubbles', nextIntroBubbles, { shouldDirty: false })
  methods.setValue('multi_images_original', nextImages, { shouldDirty: false })
}

export function useDmSave(methods: UseFormReturn<DmFormValues>) {
  const router = useRouter()
  const { data: availableTags = [] } = useTagList()
  const { openModal, closeModalByType } = useModalStore()
  const { mutateAsync: saveInProgress } = useSaveInProgress()
  const { mutateAsync: saveMultiImages } = useSaveMultiImages()
  const { mutateAsync: saveHashtags } = useSaveHashtags()
  const { mutateAsync: saveProperty } = useSaveProperty()

  const persistForm = useCallback(
    async (finishYn = 0) => {
      const formData = methods.getValues()
      const savePayload = createSavePayload(formData)

      const saveResult = await saveInProgress({ formData: savePayload, finishYn })
      if (saveResult.world_list_detail_chrbot_key) {
        methods.setValue('world_list_detail_chrbot_key', saveResult.world_list_detail_chrbot_key, {
          shouldDirty: false,
        })
      }

      const latestValues = methods.getValues()
      const multiImagePayload = createMultiImagePayload(latestValues)
      const result = await saveMultiImages(multiImagePayload)
      if (result !== null) {
        syncMultiImageSnapshot(methods, result)
      }

      // 인트로에서 참조하는 이미지의 show_yn을 form에도 반영 (saveProperty에서 img_public_key 계산에 필요)
      methods.setValue('multi_images', multiImagePayload.multi_images, { shouldDirty: false })

      const latestAfterImages = methods.getValues()
      if (latestAfterImages.hashtags.length > 0 && availableTags.length > 0) {
        await saveHashtags({
          formData: latestAfterImages as unknown as CharacterFormData,
          availableTags,
        })
      }

      if (finishYn === 1) {
        console.log('@@ [DM save] saveProperty multi_images ::', latestAfterImages.multi_images.map(img => ({
          key: img.chrbot_multi_image_key,
          show_yn: img.show_yn,
          default_yn: img.default_yn,
          lv: img.lv,
        })))
        await saveProperty(latestAfterImages as unknown as CharacterFormData)
      }
    },
    [availableTags, methods, saveHashtags, saveInProgress, saveMultiImages, saveProperty]
  )

  const handleSave = useCallback(
    async (finishYn = 0) => {
      await persistForm(finishYn)
    },
    [persistForm]
  )

  const handleSubmit = useCallback(
    () =>
      methods.handleSubmit(
        async formData => {
          const submit = async () => {
            await persistForm(1)
            router.push('/my-characters')
          }

          try {
            if (formData.finish_yn === 0 && formData.visibility === 'public') {
              openModal({
                type: 'confirm',
                props: {
                  title: '캐릭터 공개 시 주의사항',
                  description: '한 번 공개한 캐릭터는 비공개로 전환할 수 없어요!',
                  confirmText: '확인',
                  cancelText: '취소',
                  onConfirm: async () => {
                    closeModalByType('confirm')
                    try {
                      await submit()
                    } catch (e) {
                      console.error('등록 실패:', e)
                      openModal({
                        type: 'alert',
                        props: { message: '캐릭터 등록에 실패했습니다. 다시 시도해주세요.' },
                      })
                    }
                  },
                  onCancel: () => {
                    closeModalByType('confirm')
                  },
                },
              })
              return
            }

            await submit()
          } catch (e) {
            console.error('등록 실패:', e)
            openModal({
              type: 'alert',
              props: { message: '캐릭터 등록에 실패했습니다. 다시 시도해주세요.' },
            })
          }
        },
        () => {
          openModal({
            type: 'alert',
            props: { message: '필수값이 입력되지 않았습니다.' },
          })
        }
      )(),
    [closeModalByType, methods, openModal, persistForm, router]
  )

  return { handleSave, handleSubmit }
}
