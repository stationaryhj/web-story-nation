'use client'

import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils/cn'
import { getImageUri } from '@/src/shared/lib/utils/getImageUri'
import useModalStore from '../../model/stores/useModalStore'
import FormFieldHeader from './FormFieldHeader'

interface FormImageUploadProps {
  label?: string
  required?: boolean
  description?: string
  accept?: string
  value?: string | null
  onChange?: (file: File | null) => void
  errorMessage?: string
  wrapperClassName?: string
  className?: string
  notice?: string[]
}

export default function FormImageUpload({
  label,
  required,
  description,
  accept = 'image/jpg,image/jpeg,image/png,image/webp',
  value,
  onChange,
  errorMessage,
  wrapperClassName,
  className,
  notice,
}: FormImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { openModal } = useModalStore()

  const ALLOWED_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      if (!file) return

      if (!ALLOWED_TYPES.includes(file.type)) {
        openModal({
          type: 'alert',
          props: {
            message: '이미지는 JPG, JPEG, PNG, WebP만 업로드할 수 있어요.',
          },
        })
        e.target.value = ''
        return
      } else if (file.size > 10 * 1024 * 1024) {
        openModal({
          type: 'alert',
          props: { message: '이미지 용량은 10MB 이하만 업로드할 수 있어요.' },
        })
        e.target.value = ''
        return
      }

      setPreviewUrl(URL.createObjectURL(file))
      onChange?.(file)
    },
    [onChange]
  )

  const displayUrl = previewUrl || (value ? getImageUri(value) : null)

  return (
    <div className={wrapperClassName}>
      {label && <FormFieldHeader label={label} required={required} description={description} />}

      {displayUrl ? (
        <div className="relative h-40 w-40">
          <Image src={displayUrl} alt="업로드된 이미지" fill className="rounded-[10px] object-cover" />
          <div className="absolute bottom-3 right-3 gap-1 rounded-lg bg-black/80 px-[7px] py-1 duration-100 hover:bg-black">
            <label htmlFor="form-image-upload" className="flex cursor-pointer items-center justify-center gap-1">
              <div className="flex h-5 w-5 items-center justify-center">
                <FontAwesomeIcon icon={faArrowUpFromBracket} className="text-sm text-white" />
              </div>
              <p className="font-regular text-xs text-white">업로드</p>
              <input
                ref={inputRef}
                type="file"
                id="form-image-upload"
                className="hidden"
                accept={accept}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <label
          htmlFor="form-image-upload"
          className={cn(
            'flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-[10px] bg-[#F4F5F5] duration-100 hover:bg-[#D9D9D9]',
            errorMessage && 'border border-red-500',
            className
          )}
        >
          <Image src="/images/image_thumbnail.svg" alt="이미지 업로드" width={68} height={70} />
          <p className="text-xs font-medium text-[#A6A6A6]">클릭해서 이미지 업로드</p>
          <input
            ref={inputRef}
            type="file"
            id="form-image-upload"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
        </label>
      )}

      {errorMessage && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}

      {notice && (
        <div className="mt-3">
          {notice.map((text: string) => (
            <p key={text} className="text-xs text-[#6B7280]">
              {text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
