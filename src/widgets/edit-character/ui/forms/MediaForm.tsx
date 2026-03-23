'use client'

import { useRef, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import { getImageUri } from '@/src/shared/lib/utils/getImageUri'
import type { DmFormValues } from '@/src/features/edit-character/model/dmFormTypes'
import { FormFieldHeader } from '@/src/shared/ui/form'
import { useUploadImage, useUploadImages } from '@/src/features/edit-character/api/useUploadImage'
import { useDeleteMultiImage, useSaveMultiImages } from '@/src/features/edit-character/api/characterFormApi'
import { useDmSave } from '@/src/features/edit-character/lib/useDmSave'
import type { DmMultiImage } from '@/src/features/edit-character/model/dmFormTypes'
import { cn } from '@/src/shared/lib/utils/cn'
import DeleteIcon from '@/src/shared/ui/icons/DeleteIcon'
import EditIcon from '@/src/shared/ui/icons/EditIcon'
import { v4 as uuidv4 } from 'uuid'

const MAX_RULES_LENGTH = 50
const MAX_IMAGES_COUNT = 100

export default function MediaForm() {
  const methods = useFormContext<DmFormValues>()
  const { errors } = methods.formState
  const { mutateAsync: uploadImage, isPending: isPendingEdit } = useUploadImage()
  const { mutateAsync: uploadImages, isPending: isPendingAdd } = useUploadImages()
  const { mutateAsync: deleteMultiImage } = useDeleteMultiImage()
  const { mutateAsync: saveMultiImages } = useSaveMultiImages()
  const { handleSave } = useDmSave(methods)
  const isPending = isPendingEdit || isPendingAdd
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const { fields, append, remove, update } = useFieldArray({
    control: methods.control,
    name: 'multi_images',
  })

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  const chrbotKey = Number(methods.getValues('world_list_detail_chrbot_key')) || 0

  const handleAddImages = async (files: File[]) => {
    const results = await uploadImages(files)
    results.forEach((result, index) => {
      append({
        hash: uuidv4(),
        img_url: result.path,
        rules: '',
        idx: fields.length + index + 1,
        chrbot_multi_image_key: 0,
        default_yn: 0,
        lv: 0,
        show_yn: 0,
        world_list_detail_chrbot_key: chrbotKey,
      })
    })

    // S3 업로드 후 바로 서버에 저장하여 chrbot_multi_image_key를 받아옴
    const formData = methods.getValues()
    const allImages = formData.multi_images
    const serverImages = await saveMultiImages({
      world_list_detail_chrbot_key: formData.world_list_detail_chrbot_key,
      likeability_yn: formData.likeability_yn,
      multi_images: allImages,
      multi_images_original: formData.multi_images_original,
    })

    if (serverImages && serverImages.length > 0) {
      const synced: DmMultiImage[] = allImages.map(image => {
        if (image.chrbot_multi_image_key !== 0) return image
        const matched = serverImages.find(s => s.idx === image.idx && s.lv === image.lv && s.img_url === image.img_url)
        return matched ? { ...image, chrbot_multi_image_key: matched.chrbot_multi_image_key } : image
      })
      methods.setValue('multi_images', synced, { shouldDirty: false })
      methods.setValue('multi_images_original', synced, { shouldDirty: false })
    }
  }

  const handleUpdateImage = async (index: number, file: File) => {
    const { path } = await uploadImage(file)
    const current = fields[index]
    update(index, { ...current, img_url: path })
    setEditingIndex(null)
  }

  const handleDeleteImage = async (index: number) => {
    const target = fields[index]
    remove(index)

    // 인트로 버블에서 해당 이미지 참조 제거
    const tokens = [
      target.chrbot_multi_image_key ? `[${target.chrbot_multi_image_key}]` : null,
      target.hash ? `[hash:${target.hash}]` : null,
    ].filter(Boolean)

    if (tokens.length > 0) {
      const introBubbles = methods.getValues('introBubbles')
      const updated = introBubbles
        .map(group => ({
          ...group,
          messages: group.messages.filter(m => !tokens.includes(m.text)),
        }))
        .filter(group => group.messages.length > 0)

      methods.setValue('introBubbles', updated, { shouldValidate: true })
    }

    if (target.chrbot_multi_image_key) {
      await deleteMultiImage(target.chrbot_multi_image_key)

      const original = methods.getValues('multi_images_original')
      methods.setValue(
        'multi_images_original',
        original.filter(item => item.chrbot_multi_image_key !== target.chrbot_multi_image_key),
        { shouldDirty: false }
      )
    }

    // 인트로 버블 변경사항을 서버에 반영
    if (tokens.length > 0) {
      handleSave().catch(e => console.error('임시저장 실패:', e))
    }
  }

  return (
    <div className="flex flex-col px-4 py-[25px]">
      <div className="space-y-[25px] max-md:space-y-4">
        <FormFieldHeader
          label="미디어보관함"
          description="DM 채팅에서 캐릭터가 보여줄 사진과 영상을 등록하세요. (최대 100개)"
          className="mb-0"
        />

        <div className="flex flex-col gap-y-[25px]">
          <div className="grid grid-cols-2 gap-x-[10px] gap-y-3 max-md:grid-cols-1">
            {fields.map((field, index) => (
              <div key={field.id} className="relative">
                <div className="relative flex gap-x-[10px] ">
                  <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[10px]">
                    <Image
                      src={getImageUri(field.img_url)}
                      width={86}
                      height={86}
                      alt="이미지"
                      className="aspect-square rounded-[10px] object-cover"
                    />
                    {isPending && editingIndex === index && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/50">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xl text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-center justify-center gap-x-[15px] bg-black/50 py-1 hover:bg-black/80">
                      <DeleteIcon
                        size={16}
                        className="cursor-pointer text-white"
                        onClick={() => handleDeleteImage(index)}
                      />
                      <EditIcon
                        size={16}
                        className="cursor-pointer text-white"
                        onClick={() => {
                          setEditingIndex(index)
                          fileInputRef.current?.click()
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex w-full flex-col items-end gap-y-[10px] overflow-hidden rounded-[10px] border border-v2-gray-500 p-[10px]',
                      errors.multi_images?.[index]?.rules ? 'border-v2-red' : ''
                    )}
                  >
                    <textarea
                      {...methods.register(`multi_images.${index}.rules`, {
                        required: '이미지 설명을 입력해주세요.',
                      })}
                      className={cn(
                        'h-full w-full resize-none text-[13px] outline-none placeholder:text-v2-gray-600',
                        errors.multi_images?.[index]?.rules ? 'placeholder:text-v2-red' : ''
                      )}
                      maxLength={MAX_RULES_LENGTH}
                      required
                      spellCheck={false}
                      placeholder={`캐릭터의 사진이나 동영상을 설명 해주세요.\n예시) 캐릭터가 웃는 사진`}
                    />
                    <p className="text-[10px] font-medium tracking-tight">
                      {methods.watch(`multi_images.${index}.rules`)?.length || 0}/{MAX_RULES_LENGTH}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isPending && editingIndex === null && (
              <div className="flex h-full w-full items-center justify-center py-7">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-primary" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            onChange={e => {
              const files = e.target.files
              if (!files) return
              if (editingIndex !== null) {
                const file = files[0]
                if (file) handleUpdateImage(editingIndex, file)
              } else {
                handleAddImages(Array.from(files))
              }
              e.target.value = '' // 같은 파일 재선택 가능하게 초기화
            }}
          />
          {fields.length < MAX_IMAGES_COUNT && (
            <button
              type="button"
              className="w-full rounded-[10px] bg-primary px-[14px] py-[13px] text-sm text-white hover:bg-primary-600 active:bg-primary-600"
              onClick={handleClickUpload}
            >
              + 미디어 추가{fields.length > 0 && `(${fields.length}/${MAX_IMAGES_COUNT})`}
            </button>
          )}
        </div>
      </div>
      <div className="mt-8">
        <p className="text-sm font-medium text-black">이미지 업로드 시 주의사항</p>
        <ul className="text-sm font-medium text-v2-gray-700 max-md:text-xs">
          <li>• JPG, JPEG, PNG, WebP를 지원합니다.</li>
          <li>• 성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.</li>
          <li>• 초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.</li>
          <li>• 한 번 공개된 이미지는 삭제할 수 없어요(수정은 가능).</li>
          <li>• 업로드한 이미지는 다음 버튼을 클릭해야 저장돼요.</li>
        </ul>
      </div>
    </div>
  )
}
