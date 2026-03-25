'use client'

import type { DmFormValues } from '@/src/features/edit-character/model/dmFormTypes'
import { FormFieldHeader, FormTextarea } from '@/src/shared/ui/form'
import { Controller, useFormContext } from 'react-hook-form'

const MAX_CONTENT_LENGTH = 4000

const FIELDS = [
  {
    name: 'content_public' as const,
    label: '공개 설명',
    placeholder: '독자에게 공개되고 AI에게 전송되는 프롬프트예요 :) 캐릭터를 자세히 설명해 주세요!',
  },
  {
    name: 'content' as const,
    label: '비공개 설명',
    placeholder: 'AI에게만 전송되는 비밀 프롬프트에요 :) 작가님만의 비법 프롬프트를 입력해 보세요!',
  },
]

export default function CharacterSettingForm() {
  const { control, watch } = useFormContext<DmFormValues>()
  const contentLength = watch('content')?.length ?? 0
  const contentPublicLength = watch('content_public')?.length ?? 0
  const totalLength = contentLength + contentPublicLength

  return (
    <div className="flex flex-col gap-8 px-4 py-[25px]">
      <div className="flex flex-col gap-y-8">
        {FIELDS.map(field => {
          const ownLength = field.name === 'content' ? contentLength : contentPublicLength
          const otherLength = field.name === 'content' ? contentPublicLength : contentLength
          const maxForThis = MAX_CONTENT_LENGTH - otherLength

          return (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <div>
                  <div className="flex justify-between">
                    <FormFieldHeader label={field.label} />
                    <p className="text-sm text-v2-gray-700 max-md:text-xs">{ownLength}</p>
                  </div>
                  <FormTextarea
                    placeholder={field.placeholder}
                    value={value}
                    onChange={e => {
                      const newValue = e.target.value
                      onChange(newValue.length <= maxForThis ? newValue : newValue.slice(0, maxForThis))
                    }}
                    autoResize={{}}
                    {...rest}
                  />
                </div>
              )}
            />
          )
        })}
        <div className="flex justify-end">
          <p className="text-sm text-v2-gray-700">
            전체 상세 설명 글자수: {totalLength}/{MAX_CONTENT_LENGTH}(남은 글자 수: {MAX_CONTENT_LENGTH - totalLength}
            자)
          </p>
        </div>
      </div>
    </div>
  )
}
