'use client'

import type { ComponentType } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import type {
  CharacterRating,
  CharacterVisibility,
  DmFormValues,
} from '@/src/features/edit-character/model/dmFormTypes'
import { cn } from '@/src/shared/lib/utils/cn'
import useModalStore from '@/src/shared/model/stores/useModalStore'
import { FormFieldHeader, FormTextarea } from '@/src/shared/ui/form'
import PrivateAccessIcon from '@/src/shared/ui/icons/PrivateAccessIcon'
import PublicAccessIcon from '@/src/shared/ui/icons/PublicAccessIcon'
import ShieldCheckIcon from '@/src/shared/ui/icons/ShieldCheckIcon'
import VerifiedIcon from '@/src/shared/ui/icons/VerifiedIcon'

interface OptionItem<TValue extends string> {
  label: string
  description: string
  icon: ComponentType<{ className?: string; size?: number }>
  color: string
  value: TValue
}

interface OptionSectionProps<TName extends 'visibility' | 'rating'> {
  name: TName
  label: string
  description?: string
  options: OptionItem<DmFormValues[TName]>[]
  isLocked?: boolean
}

const visibilityOptions: OptionItem<CharacterVisibility>[] = [
  {
    label: '공개',
    description: '모두가 이 캐릭터와 대화할 수 있어요.',
    icon: PublicAccessIcon,
    color: '#0084FF',
    value: 'public',
  },
  {
    label: '비공개',
    description: '나만 이 캐릭터와 대화할 수 있어요.',
    icon: PrivateAccessIcon,
    color: '#909090',
    value: 'private',
  },
]

const ageRatingOptions: OptionItem<CharacterRating>[] = [
  {
    label: '전체이용가',
    description: '모두가 이 캐릭터와 대화할 수 있어요.',
    icon: VerifiedIcon,
    color: '#0CCE62',
    value: 'all',
  },
  {
    label: '성인',
    description: '성인만 이 캐릭터와 대화할 수 있어요.',
    icon: ShieldCheckIcon,
    color: '#EC872B',
    value: 'adult',
  },
]

function OptionSection<TName extends 'visibility' | 'rating'>({
  name,
  label,
  description,
  options,
  isLocked = false,
}: OptionSectionProps<TName>) {
  const { control } = useFormContext<DmFormValues>()
  const { openModal } = useModalStore()

  return (
    <div>
      <FormFieldHeader label={label} required description={description} />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-3 ">
            {options.map(option => {
              const isSelected = field.value === option.value
              const inputId = `${name}-${option.value}`

              return (
                <label
                  htmlFor={inputId}
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-x-4 rounded-[10px] border px-[10px] py-[16px] transition-colors',
                    isSelected ? 'border-primary-500' : 'border-gray-400'
                  )}
                >
                  <input
                    type="radio"
                    id={inputId}
                    name={field.name}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => {
                      if (isLocked) {
                        openModal({
                          type: 'alert',
                          props: {
                            message: '공개된 캐릭터는 비공개로 전환할 수 없어요!',
                          },
                        })
                        return
                      }

                      field.onChange(option.value)
                    }}
                    onBlur={field.onBlur}
                    className="h-4 w-4 accent-primary-500"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <div style={{ color: option.color }}>
                        <option.icon size={20} />
                      </div>
                      <span className="text-sm font-bold">{option.label}</span>
                    </div>
                    <span className="text-xs text-v2-gray-700">{option.description}</span>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      />
    </div>
  )
}

export default function RegisterForm() {
  const { control, watch } = useFormContext<DmFormValues>()
  const isVisibilityLock = watch('isVisibilityLock')
  return (
    <div className="flex flex-col gap-8 px-4 py-[25px]">
      <OptionSection
        name="visibility"
        label="공개 설정"
        description="한 번 공개된 캐릭터는 비공개로 수정할 수 없어요."
        options={visibilityOptions}
        isLocked={isVisibilityLock}
      />
      <OptionSection name="rating" label="이용 등급" options={ageRatingOptions} />

      <Controller
        name="writer_note"
        control={control}
        render={({ field, fieldState }) => (
          <FormTextarea
            ref={field.ref}
            label="작가의 말"
            placeholder="독자에게 하고싶은 말을 자유롭게 입력해 보세요!"
            maxLength={1000}
            showCount
            value={field.value}
            onChange={field.onChange}
            rows={10}
            errorMessage={fieldState.error?.message}
            autoResize={{ maxRows: 20 }}
          />
        )}
      />
    </div>
  )
}
