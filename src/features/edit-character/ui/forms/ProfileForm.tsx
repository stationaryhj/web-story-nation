'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { useUploadImage } from '../../api/useUploadImage'
import type { DmFormValues } from '../../model/dmFormTypes'
import { FormButtonGroup, FormImageUpload, FormInput, FormTextarea } from '@/src/shared/ui/form'

export default function ProfileForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext<DmFormValues>()
  const { mutateAsync: uploadImage } = useUploadImage()

  return (
    <div className="flex flex-col gap-8 px-4 py-[25px] max-md:gap-y-6">
      <Controller
        name="imgUrl"
        control={control}
        rules={{ required: '이미지를 업로드해주세요.' }}
        render={({ field, fieldState }) => (
          <FormImageUpload
            label="이미지"
            required
            description="홈 화면에서 썸네일 이미지로 나타날 거예요."
            value={field.value}
            onChange={async file => {
              if (file) {
                const previewUrl = URL.createObjectURL(file)
                field.onChange(previewUrl)
                try {
                  const { path } = await uploadImage(file)
                  field.onChange(path)
                } catch (error) {
                  console.error('이미지 업로드 실패:', error)
                  field.onChange('')
                }
              } else {
                field.onChange('')
              }
            }}
            errorMessage={fieldState.error?.message}
            notice={[
              '*초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.',
              '*JPG, JPEG, PNG, WebP를 지원합니다.',
            ]}
          />
        )}
      />
      <Controller
        name="name"
        control={control}
        rules={{ required: '이름을 입력해주세요.' }}
        render={({ field, fieldState }) => (
          <FormInput
            ref={field.ref}
            label="이름"
            required
            maxLength={25}
            showCount
            placeholder="캐릭터 이름을 입력하세요."
            errorMessage={fieldState.error?.message}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="gender"
        control={control}
        rules={{ required: '성별을 선택해주세요.' }}
        render={({ field, fieldState }) => (
          <FormButtonGroup
            label="성별"
            required
            options={[
              { label: '남성', value: 'male' },
              { label: '여성', value: 'female' },
              { label: '알 수 없음', value: 'unspecified' },
            ]}
            value={field.value}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="bio"
        control={control}
        rules={{ required: '한 줄 소개를 입력해주세요.' }}
        render={({ field, fieldState }) => (
          <FormTextarea
            label="한 줄 소개"
            required
            rows={1}
            maxLength={80}
            showCount
            placeholder="예) 까칠한 뱀파이어"
            value={field.value}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
            autoResize={{ maxRows: 4 }}
          />
        )}
      />
    </div>
  )
}
